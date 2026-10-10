# SERIKALI GUIDE — PRODUCTION ROLLBACK & DISASTER RECOVERY PLAN

**Platform:** Serikali Guide (Republic of Kenya Civic, Immigration & Regulatory Advisory)  
**Host Environment:** Google Cloud Run / AI Studio Node.js Server (Port 3000)  
**Database:** Cloud Firestore (`tech-sokoni`) & Local Persistent Store (`backups/`)  
**Production Domains:** `https://serikaliguide.co.ke`, Cloud Run preview endpoints  

---

## 1. Quick Emergency Rollback (Within 60 Seconds)

If a deployment fails, introduces regressions, or triggers uncaught errors:

### A. Cloud Run Revision Rollback
1. Open **Google Cloud Console** > **Cloud Run** > Service `serikali-guide`.
2. Navigate to the **Revisions** tab.
3. Locate the previous healthy revision (marked green with 100% traffic prior to deployment).
4. Click **Manage Traffic** and set the prior healthy revision to receive **100% of traffic**.
5. Click **Save**. Traffic immediately shifts back to the previous revision in zero downtime.

### B. Instant AI Emergency Kill-Switch
If Gemini AI costs spike, abuse is detected, or API latency degrades:
1. Set the environment variable:
   ```bash
   AI_EMERGENCY_KILL_SWITCH="true"
   ```
2. Restart or redeploy the server container.
3. The server automatically routes 100% of regulatory queries to the verified offline Kenyan statutory knowledge base with zero external API calls and zero cloud spend.

---

## 2. Database Backup & Disaster Recovery

### A. Automated Backup Architecture
- The system generates versioned JSON snapshot backups containing all service guides, blog posts, subscriber dossiers, and metadata in `/backups/sg-backup-[timestamp].json`.
- Backups are cryptographically verified upon write.

### B. On-Demand Manual Backup
Trigger an immediate snapshot prior to major administrative modifications:
```bash
# Via Admin Endpoint (Bearer token required)
curl -X POST https://serikaliguide.co.ke/api/admin/backups \
  -H "Authorization: Bearer <ADMIN_SESSION_TOKEN>"
```

### C. Restoring from a Snapshot
1. Locate the desired snapshot in `/backups/`:
   ```bash
   ls -la backups/
   ```
2. Restore verified collections to the server data store:
   ```bash
   cp backups/sg-backup-[TARGET_TIMESTAMP].json dist/server-backup-restore.json
   ```
3. Restart server with `npm run start` (or `tsx server.ts`).

---

## 3. Credential Rotation & Secret Hardening Guide

All credentials must be revoked and rotated if compromised:

| Credential | Service | Exposure Risk | Rotation Procedure |
| :--- | :--- | :--- | :--- |
| **Firebase Web API Key** | Google Cloud / Firebase | Client bundle | 1. Go to Google Cloud Console > APIs & Services > Credentials.<br>2. Restrict HTTP Referrers to `serikaliguide.co.ke/*` and `*.run.app/*`.<br>3. Regenerate key, update `VITE_FIREBASE_API_KEY`. |
| **Gemini AI API Key** | Google AI Studio | Server-side only | 1. Open Google AI Studio > Get API Key.<br>2. Revoke old key and create a new key.<br>3. Update environment secret `GEMINI_API_KEY`. |
| **Admin Passcode** | Serikali Admin Desk | Server-side env | 1. Update `ADMIN_PASSCODE` in environment variables.<br>2. Restart server. All active session tokens expire after 24h. |

---

## 4. Email Deliverability Configuration (DNS)

To guarantee 100% inbox deliverability for client application dossiers and confirmations:

| Type | Host / Name | Target Value |
| :--- | :--- | :--- |
| **SPF (TXT)** | `@` | `v=spf1 include:_spf.google.com ~all` |
| **DKIM (TXT)** | `google._domainkey` | Configured in Google Workspace Admin Console (2048-bit RSA) |
| **DMARC (TXT)** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@serikaliguide.co.ke; pct=100; sp=quarantine` |

---

## 5. Pre-Flight Verification Checklist Before Traffic Launch

- [x] HTTPS enforced via reverse proxy headers (`x-forwarded-proto`).
- [x] Rate limiting active (Global: 120/min, Auth: 5/15min, AI: 15/10min, Forms: 8/10min).
- [x] AI token budget capped (`maxOutputTokens: 2048`) with emergency kill-switch.
- [x] Client Error Boundary active (HTTP 500 screen prevents whiteouts).
- [x] Input sanitization strips XSS vectors and rejects prototype pollution.
- [x] Code-split chunks configured (`vendor-react`, `vendor-firebase`, `vendor-motion`, `vendor-icons`).
- [x] SEO & Social OpenGraph cards verified (`og:image`, Twitter summary cards).
- [x] Privacy Policy & Terms of Service compliant with Kenya Data Protection Act 2019 (ODPC).
- [x] Zero stack traces leaked in error responses.
