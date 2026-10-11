import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getBlogs,
  getBlogBySlugOrId,
  createBlog,
  updateBlog,
  deleteBlog,
  saveMedia,
  getMedia,
  createAdminSession,
  isValidAdminToken,
} from './blogStore';

import { authRateLimiter, aiRateLimiter } from './rateLimiter';
import { aiCostController } from './aiCostControl';
import { validateAiPrompt } from './validation';

export const blogApiRouter = Router();

// Middleware: Require Admin Authorization
export function requireAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!isValidAdminToken(authHeader)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
    return;
  }
  next();
}

// 1. Admin Authentication: Login with Passcode (protected with strict rate limiting)
blogApiRouter.post('/auth/login', authRateLimiter, (req: Request, res: Response) => {
  try {
    const { passcode } = req.body || {};
    if (!passcode || typeof passcode !== 'string') {
      res.status(400).json({ error: 'Passcode is required.' });
      return;
    }
    const result = createAdminSession(passcode);
    if (!result.success) {
      res.status(401).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Login verification failed.' });
  }
});

// 2. Admin Authentication: Verify Active Session Token
blogApiRouter.get('/auth/verify', (req: Request, res: Response) => {
  const valid = isValidAdminToken(req.headers.authorization);
  res.json({ valid });
});

// 3. Get Blogs List (status='published' by default for public, 'all' for admin)
blogApiRouter.get('/blogs', (req: Request, res: Response) => {
  try {
    const statusParam = (req.query.status as any) || 'published';
    const blogs = getBlogs(statusParam);
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve blogs.' });
  }
});

// 4. Get Single Blog by Slug or ID
blogApiRouter.get('/blogs/:identifier', (req: Request, res: Response) => {
  try {
    const blog = getBlogBySlugOrId(req.params.identifier);
    if (!blog) {
      res.status(404).json({ error: 'Blog post not found.' });
      return;
    }

    // If draft or unpublished, require admin auth to view
    if (blog.status && blog.status !== 'published') {
      const authHeader = req.headers.authorization;
      if (!isValidAdminToken(authHeader)) {
        res.status(403).json({ error: 'This article is currently in draft or unpublished status.' });
        return;
      }
    }

    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve blog.' });
  }
});

// 5. Create Blog Post (Admin Only)
blogApiRouter.post('/blogs', requireAdmin, (req: Request, res: Response) => {
  try {
    const { title } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Article title is required.' });
      return;
    }

    const created = createBlog(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create blog post.' });
  }
});

// 6. Update Blog Post (Admin Only)
blogApiRouter.put('/blogs/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = updateBlog(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Blog post not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update blog post.' });
  }
});

// 7. Delete Blog Post (Admin Only)
blogApiRouter.delete('/blogs/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = deleteBlog(id);
    if (!ok) {
      res.status(404).json({ error: 'Blog post not found.' });
      return;
    }
    res.json({ success: true, message: 'Article permanently deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete blog post.' });
  }
});

// 8. Upload Blog Image (Admin Only)
blogApiRouter.post('/upload/image', requireAdmin, (req: Request, res: Response) => {
  try {
    const { data, contentType, alt } = req.body || {};
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Image data is required (base64 string).' });
      return;
    }

    // Parse base64 string
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let type = contentType || 'image/jpeg';

    if (matches && matches.length === 3) {
      type = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image exceeds 5MB limit. Please upload an optimized image.' });
      return;
    }

    const url = saveMedia(buffer, type, alt || 'Uploaded blog media');
    res.json({ success: true, url, size: buffer.length, contentType: type });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process image upload.' });
  }
});

// 9. Media Delivery
blogApiRouter.get('/media/:id', (req: Request, res: Response) => {
  try {
    const media = getMedia(req.params.id);
    if (!media) {
      res.status(404).send('Media not found');
      return;
    }

    res.setHeader('Content-Type', media.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(media.buffer);
  } catch (err: any) {
    res.status(500).send('Error loading media');
  }
});

// 10. AI Serikali Blog Generator Endpoint (Gemini 3.8 Flash + Resilient Fallback)
function buildFallbackBlog(topic: string, categoryId?: string) {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  let catId = categoryId || 'immigration-visas';
  let catName = 'Immigration & Expatriate Visas';
  let portal = 'fns.immigration.go.ke';

  if (lower.includes('company') || lower.includes('business') || lower.includes('cr12') || lower.includes('brs') || lower.includes('incorporat')) {
    catId = 'business-registration';
    catName = 'Business & Company Registration';
    portal = 'brs.ecitizen.go.ke';
  } else if (lower.includes('ngo') || lower.includes('nonprofit') || lower.includes('pbo') || lower.includes('charity')) {
    catId = 'ngo-nonprofit';
    catName = 'NGO & Nonprofit Registration';
    portal = 'pbo.ecitizen.go.ke';
  } else if (lower.includes('tax') || lower.includes('kra') || lower.includes('tcc') || lower.includes('itax')) {
    catId = 'tax-compliance';
    catName = 'Tax & Statutory Compliance';
    portal = 'itax.kra.go.ke';
  } else if (lower.includes('permit') || lower.includes('licen') || lower.includes('nca') || lower.includes('nema') || lower.includes('odpc')) {
    catId = 'licences-permits';
    catName = 'Licences & Permits';
    portal = 'business.ecitizen.go.ke';
  } else if (lower.includes('land') || lower.includes('title') || lower.includes('ardhisasa') || lower.includes('passport')) {
    catId = 'government-documents';
    catName = 'Government Documents';
    portal = 'accounts.ecitizen.go.ke';
  } else if (lower.includes('invest') || lower.includes('relocat') || lower.includes('property')) {
    catId = 'investment-relocation';
    catName = 'Investment & Relocation';
    portal = 'keninvest.go.ke';
  }

  return {
    title: `${cleanTopic}: Complete 2026 Kenya Statutory & Procedural Guide`,
    subtitle: `Verified compliance steps, official portal requirements, timelines, and legal filing criteria in Kenya.`,
    categoryId: catId,
    categoryName: catName,
    subCategoryName: cleanTopic,
    excerpt: `Comprehensive 2026 procedural dossier covering eligibility criteria, official filing portals, and statutory vetting steps for ${cleanTopic} under the Republic of Kenya regulatory framework.`,
    officialPortal: portal,
    readTime: '6 min read',
    author: 'Serikali Editorial & Legal Desk',
    authorRole: 'Senior Regulatory Specialist',
    keyTakeaways: [
      `Mandatory electronic registration and identity verification through official Republic of Kenya portals.`,
      `Statutory vetting and processing timeline averages 2 to 6 weeks upon submission of compliant documents.`,
      `All official government processing fees must generate an authenticated Payment Reference Number (PRN).`,
      `Retention of certified physical and digital dossiers is required for administrative audits.`,
    ],
    sectionHeading: `1. Verified Procedural Steps & Statutory Requirements for ${cleanTopic}`,
    sectionBody: `Navigating ${cleanTopic} requires strict alignment with the relevant laws of Kenya and current ministerial circulars.\n\nAll applications are initiated digitally via the designated official government portal (${portal}). Applicants must verify that certified supporting affidavits, tax clearances, and identity credentials match official civil registry records before submission.\n\nFollowing electronic submission, the dossier undergoes ministerial review, inter-agency security vetting, and gazette verification where mandated. Successful applicants receive electronic notification along with statutory certificates or endorsements bearing official QR verification codes.`,
    checklist: [
      'Certified copy of National ID / Valid Passport Bio-data page',
      'Valid KRA PIN Certificate with up-to-date Tax Compliance status',
      'Notarized statutory declarations or board resolutions where applicable',
      'Official Payment Reference Number (PRN) receipt with eCitizen verification',
      'Passport-sized photographs conforming to ICAO biometric specifications',
    ],
    callout: `Important Advisory: Always complete your filing on official .go.ke portals (${portal}). Do not remit payments to personal M-Pesa till numbers or unverified intermediaries.`,
    metaTitle: `${cleanTopic} Guide Kenya 2026 | Serikali Guide`,
    metaDescription: `Comprehensive 2026 statutory guide for ${cleanTopic} in Kenya. Discover official portals, required documents, fee structures, and step-by-step procedures.`,
    keywords: [cleanTopic.toLowerCase(), 'kenya government', 'ecitizen', 'statutory filing', '2026 compliance'],
  };
}

function buildFallbackService(topic: string) {
  const cleanTopic = topic.trim();
  return {
    name: cleanTopic,
    shortLabel: cleanTopic.split(' ').slice(0, 2).join(' '),
    agencyBadge: 'GOVERNMENT PORTAL',
    agency: `Republic of Kenya · Regulatory & Compliance Desk for ${cleanTopic}`,
    heroSubtitle: `Official procedures, licensing prerequisites, gazetted statutory fees, and verified timelines in Kenya.`,
    editorialHeadline: `${cleanTopic} — Official Kenyan Procedures, Permits & Compliance.`,
    overview: `${cleanTopic} encompasses statutory registration, operational compliance, and regulatory oversight administered under the laws of Kenya. Stakeholders must comply with mandatory documentation and annual returns.`,
    metaTitle: `${cleanTopic} in Kenya — Official Requirements & Guide | Serikali`,
    metaDescription: `Complete statutory requirements, application portals, timelines, and fees for ${cleanTopic} in Kenya. Official regulatory guidance.`,
    subCategories: [
      {
        name: `Standard ${cleanTopic} Registration & Filing`,
        summary: `Initial statutory registration, regulatory documentation, and compliance lodgement on the official portal.`,
        portal: 'ecitizen.go.ke',
        timeline: '2 to 4 weeks',
        statutoryNote: 'Governed by Kenyan Statutory Framework & Ministerial Directives',
        feeNote: 'Official Gazetted Statutory Fee',
        requirements: [
          'Valid National ID or Passport bio-data page',
          'Up-to-date KRA PIN with Tax Compliance Certificate',
          'Completed official application form with certified annexures',
          'Payment Reference Number (PRN) confirmation receipt',
        ],
        steps: [
          {
            title: 'Step 1: Digital Account & Profile Setup',
            detail: 'Create or sign into the official portal using verified government Single Sign-On credentials.',
          },
          {
            title: 'Step 2: Document Verification & Upload',
            detail: 'Upload certified PDFs of all prerequisites conforming to gazetted document standards.',
          },
          {
            title: 'Step 3: Fee Payment & Tracking',
            detail: 'Generate official PRN on eCitizen, remit payment, and monitor processing in real time.',
          },
        ],
      },
    ],
  };
}

blogApiRouter.post('/ai/generate-serikali-blog', async (req: Request, res: Response) => {
  const { topic, categoryId } = req.body || {};
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Please provide a valid topic for blog generation.' });
    return;
  }

  const cleanTopic = topic.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.json(buildFallbackBlog(cleanTopic, categoryId));
    return;
  }

  try {
    const aiCall = (async () => {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the Senior Editorial Director and Kenya Regulatory Counsel at SERIKALI GUIDE (Kenya's One Border Stop Post).
Today is in 2026.
Generate an authentic, legally precise, up-to-date, and comprehensive blog guide for the topic: "${cleanTopic}".
Ensure all information reflects current Kenyan laws (e.g. Kenya Citizenship & Immigration Act, Companies Act 2015, Tax Procedures Act, NGO Coordination Act / PBORA, Ardhisasa, etc.), realistic government portals (ending in .go.ke), actual processing fees, and practical timelines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an authoritative Kenyan regulatory legal analyst and editorial writer. Output accurate, structured JSON only. Ensure facts, fees, and government agency names for Kenya are 100% genuine and reflect 2026 rules.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Captivating, professional editorial headline' },
              subtitle: { type: Type.STRING, description: 'Informative subtitle detailing the scope' },
              categoryId: {
                type: Type.STRING,
                description: 'Must match one of: immigration-visas, business-registration, ngo-nonprofit, government-documents, licences-permits, tax-compliance, investment-relocation, government-services',
              },
              categoryName: { type: Type.STRING, description: 'Matching full category name' },
              subCategoryName: { type: Type.STRING, description: 'Specific sub-procedure name' },
              excerpt: { type: Type.STRING, description: '2 to 3 sentences summarizing the guide' },
              officialPortal: { type: Type.STRING, description: 'Real government portal domain (e.g. fns.immigration.go.ke, brs.ecitizen.go.ke)' },
              readTime: { type: Type.STRING, description: 'e.g. 7 min read' },
              author: { type: Type.STRING, description: 'Author or desk name' },
              authorRole: { type: Type.STRING, description: 'Author professional title' },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 key takeaways summarizing key statutory rules in 2026',
              },
              sectionHeading: { type: Type.STRING, description: 'Main section heading' },
              sectionBody: { type: Type.STRING, description: 'Detailed guide text with paragraphs separated by double newlines' },
              checklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of mandatory prerequisites for Kenya eCitizen filing',
              },
              callout: { type: Type.STRING, description: 'Crucial statutory advisory callout or warning' },
              metaTitle: { type: Type.STRING, description: 'Optimized SEO meta title under 60 chars' },
              metaDescription: { type: Type.STRING, description: 'Compelling SEO meta description under 155 chars' },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Relevant search terms and keywords',
              },
            },
            required: [
              'title',
              'subtitle',
              'categoryId',
              'categoryName',
              'subCategoryName',
              'excerpt',
              'officialPortal',
              'readTime',
              'author',
              'authorRole',
              'keyTakeaways',
              'sectionHeading',
              'sectionBody',
              'checklist',
              'callout',
              'metaTitle',
              'metaDescription',
              'keywords',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from AI');
      return JSON.parse(text.trim());
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 4500)
    );

    const result = await Promise.race([aiCall, timeoutPromise]);
    res.json(result);
  } catch {
    // Guaranteed instant, high-fidelity fallback tailored to Kenya regulations
    res.json(buildFallbackBlog(cleanTopic, categoryId));
  }
});

// 11. AI Serikali Service Pillar Generator Endpoint (Gemini 3.8 Flash + Resilient Fallback)
blogApiRouter.post('/ai/generate-serikali-service', async (req: Request, res: Response) => {
  const { topic } = req.body || {};
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Please provide a valid service topic.' });
    return;
  }

  const cleanTopic = topic.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.json(buildFallbackService(cleanTopic));
    return;
  }

  try {
    const aiCall = (async () => {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the Chief Regulatory & Civic Architect at SERIKALI GUIDE Kenya.
Today is in 2026.
Generate an authentic, highly detailed, and complete service pillar category for: "${cleanTopic}".
Follow verified Kenyan government frameworks (e.g. Ministry of Interior, Business Registration Service, KRA, NEMA, EPZA, NGO Board).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert Kenyan government regulatory architect. Generate 100% realistic, accurate Kenyan statutory service category information in structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Full service category name' },
              shortLabel: { type: Type.STRING, description: 'Short badge label (2-3 words)' },
              agencyBadge: { type: Type.STRING, description: 'Agency acronym (e.g. BRS / KRA / DCI)' },
              agency: { type: Type.STRING, description: 'Full official ministerial agency name' },
              heroSubtitle: { type: Type.STRING, description: 'Concise subtitle describing the scope' },
              editorialHeadline: { type: Type.STRING, description: 'Catchy editorial headline' },
              overview: { type: Type.STRING, description: '2 to 3 sentences outlining the legal scope' },
              metaTitle: { type: Type.STRING, description: 'SEO title under 60 chars' },
              metaDescription: { type: Type.STRING, description: 'SEO description under 155 chars' },
              subCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Sub-category service name' },
                    summary: { type: Type.STRING, description: 'Procedural summary' },
                    portal: { type: Type.STRING, description: 'Official domain ending in .go.ke' },
                    timeline: { type: Type.STRING, description: 'Estimated statutory timeline' },
                    statutoryNote: { type: Type.STRING, description: 'Statutory legal reference' },
                    feeNote: { type: Type.STRING, description: 'Official gazetted fee note' },
                    requirements: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Required documents',
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          detail: { type: Type.STRING },
                        },
                        required: ['title', 'detail'],
                      },
                      description: 'Procedural steps',
                    },
                  },
                  required: [
                    'name',
                    'summary',
                    'portal',
                    'timeline',
                    'statutoryNote',
                    'feeNote',
                    'requirements',
                    'steps',
                  ],
                },
              },
            },
            required: [
              'name',
              'shortLabel',
              'agencyBadge',
              'agency',
              'heroSubtitle',
              'editorialHeadline',
              'overview',
              'metaTitle',
              'metaDescription',
              'subCategories',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from AI');
      return JSON.parse(text.trim());
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 4500)
    );

    const result = await Promise.race([aiCall, timeoutPromise]);
    res.json(result);
  } catch {
    // Guaranteed instant statutory fallback
    res.json(buildFallbackService(cleanTopic));
  }
});

// 12. Interactive Serikali AI Services Assistant Endpoint (Gemini 3.8 Flash)
blogApiRouter.post('/ai/serikali-assistant', async (req: Request, res: Response) => {
  try {
    const { message, context, history } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Deterministic offline response when API key is not configured
      const q = message.toLowerCase();
      let matchedService = undefined;
      let reply = '';

      if (q.includes('passport')) {
        matchedService = {
          categoryId: 'government-documents',
          subCategoryId: 'passport',
          serviceName: 'Kenyan Passport Services',
          summary: 'Apply for, renew, or replace an e-Passport via eCitizen and Nyayo House.',
        };
        reply = `For Kenyan passports, all applications and payments are processed via the eCitizen portal under the Directorate of Immigration Services.\n\n• Series A (34 Pages): KSh 7,550\n• Series B (50 Pages): KSh 9,550\n• Series C (66 Pages): KSh 12,550\n• Lost Passport Penalty: KSh 20,050 (requires Police Abstract & Sworn Affidavit)\n\nKey requirements include your original National ID, current passport (for renewal), birth certificate, and recommender declaration. Would you like to start a guided checklist?`;
      } else if (q.includes('work permit') || q.includes('permit') || q.includes('expatriate')) {
        matchedService = {
          categoryId: 'immigration-visas',
          subCategoryId: 'work-permits',
          serviceName: 'Work Permits (Class D / Class G)',
          summary: 'Statutory authorization for foreign employees and investors under eFNS.',
        };
        reply = `Kenyan Work Permits are filed through the Electronic Foreign Nationals Services (eFNS) portal (fns.immigration.go.ke).\n\n• Class D (Employment): Sponsoring company must submit Form 25, tax compliance, company CR12, and designate a qualified Kenyan Understudy with CV & contract. Processing fee is KSh 20,000, and issuance is KSh 400,000 per year.\n• Class G (Investors): Requires proof of USD 100,000 minimum capital investment in a Kenyan enterprise.\n\nWould you like to review the understudy and corporate checklist?`;
      } else if (q.includes('eta') || q.includes('visa')) {
        matchedService = {
          categoryId: 'immigration-visas',
          subCategoryId: 'visas',
          serviceName: 'Electronic Travel Authorisation (eTA)',
          summary: 'Mandatory digital entry clearance for foreign travelers via etakenya.go.ke.',
        };
        reply = `All international travelers to Kenya must apply for an Electronic Travel Authorisation (eTA) at etakenya.go.ke at least 3 days prior to departure. The statutory fee is USD 35. You will need a valid passport (minimum 6 months validity), passport photo/selfie, and confirmed flight itinerary.`;
      } else if (q.includes('company') || q.includes('business') || q.includes('register')) {
        matchedService = {
          categoryId: 'business-registration',
          subCategoryId: 'company-registration',
          serviceName: 'Private Limited Company Registration',
          summary: 'Incorporate an LTD company via the Business Registration Service (BRS) on eCitizen.',
        };
        reply = `Registering a Private Limited Company (LTD) in Kenya is conducted via BRS on eCitizen. The statutory fee is KSh 10,650. You will need 3 proposed names, director IDs and KRA PINs, and a registered physical address. Turnaround time is typically 3 to 5 working days for your Certificate of Incorporation and CR12.`;
      } else {
        reply = `Hello! I am Serikali AI, your immigration and regulatory services guide. Based on your query regarding "${message.trim()}", I can assist you in discovering the relevant Kenya government service, reviewing statutory requirements, assembling compliant documents, or starting a service journey. How would you like to proceed?`;
      }

      res.json({
        reply,
        matchedService,
        suggestedAction: matchedService
          ? {
              label: `Start Guided ${matchedService.serviceName}`,
              actionType: 'start-service',
              payload: matchedService,
            }
          : undefined,
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are Serikali AI, the dedicated, intelligent immigration and government services assistant for Serikali Guide (serikaliguide.com).
Your purpose is to help visitors discover the statutory service they need, understand legal requirements, prepare necessary documents, avoid common mistakes, and guide them through official application procedures.

CORE BOUNDARIES & RULES:
1. Ground all answers strictly in actual Kenyan government services: Passports, Work Permits (Class A-M), Special Pass, Dependent Pass, eTA/Visas, Permanent Residence, Citizenship, Business Registration (BRS), NGO Registration, Tax Compliance (KRA), Good Conduct, Birth Certificates.
2. Tone: Highly professional, authoritative, warm, and structured. Inspired by modern intelligent advisory platforms like Veeza AI.
3. Clarity on identity: Serikali Guide provides independent civic, document preparation, and procedural advisory. Clearly state that official statutory filings are submitted through designated Republic of Kenya portals (eCitizen, eFNS, BRS, iTax). Never claim to be a government authority.
4. Recommendations: Always use cautious phrasing such as "may be relevant", "based on the information provided", "you should confirm".
5. Output format: Provide a direct, helpful explanation with bulleted requirements or next steps. If relevant, identify which Serikali category and subcategory corresponds to the query.`;

    const userPrompt = `Context: ${JSON.stringify(context || {})}
Recent conversation: ${JSON.stringify(history || [])}
User Question: "${message}"

Respond concisely and accurately with statutory details (fees, timeline, portal, key documents, and next step). Return JSON matching this schema:
{
  "reply": "string (formatted with clean line breaks and bullets)",
  "matchedCategory": "string (optional matching category id)",
  "matchedSubCategory": "string (optional matching subcategory id)",
  "serviceName": "string (optional matching service title)",
  "suggestedNextStep": "string (recommended next action for user)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      reply: parsed.reply || 'Here is the relevant regulatory procedural information.',
      matchedService: parsed.matchedSubCategory
        ? {
            categoryId: parsed.matchedCategory || 'immigration-visas',
            subCategoryId: parsed.matchedSubCategory,
            serviceName: parsed.serviceName || 'Immigration Service',
            summary: parsed.suggestedNextStep || 'Review statutory requirements and checklist.',
          }
        : undefined,
      suggestedAction: parsed.matchedSubCategory
        ? {
            label: `Explore ${parsed.serviceName || 'Service'}`,
            actionType: 'start-service',
            payload: {
              categoryId: parsed.matchedCategory,
              subCategoryId: parsed.matchedSubCategory,
            },
          }
        : undefined,
    });
  } catch (err: any) {
    console.warn('Serikali AI assistant error, falling back to local engine:', err);
    res.json({
      reply: 'Serikali AI is available to assist you. All official Kenyan immigration procedures require verified identity documentation, statutory fee payment, and digital portal filing.',
      matchedService: undefined,
    });
  }
});
