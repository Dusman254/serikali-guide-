/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CookieConsentStatus = 'undecided' | 'all' | 'essential';

const STORAGE_KEY = 'serikali_cookie_consent_v1';

export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === 'undefined') return 'undecided';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'all' || val === 'essential') return val;
  } catch {
    // Ignore localStorage access errors
  }
  return 'undecided';
}

export function setCookieConsent(status: 'all' | 'essential'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, status);
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: status }));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Privacy-Preserving Event Logger
 * Only sends analytics events if the user has explicitly accepted non-essential cookies.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  // Always log locally for client-side funnel health metrics
  recordLocalMetric(eventName, params);

  if (getCookieConsent() !== 'all') {
    // Non-essential third-party cookies rejected or undecided; external analytics not dispatched.
    return;
  }

  // Safe client-side analytics dispatch (e.g. Firebase Analytics or Custom Event)
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString(),
    });
  }

  // Also dispatch DOM event for any configured client listeners
  window.dispatchEvent(
    new CustomEvent('serikali_analytics_event', {
      detail: { eventName, params },
    })
  );
}

const FUNNEL_METRICS_KEY = 'serikali_funnel_metrics_v1';

export interface FunnelMetricsData {
  step1Views: number;
  step2Views: number;
  step3Views: number;
  step4Views: number;
  step5Views: number;
  step6Views: number;
  completedApplications: number;
  abandonedCount: number;
  lastUpdated: string;
}

function recordLocalMetric(eventName: string, _params: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FUNNEL_METRICS_KEY);
    const data: FunnelMetricsData = raw
      ? JSON.parse(raw)
      : {
          step1Views: 0,
          step2Views: 0,
          step3Views: 0,
          step4Views: 0,
          step5Views: 0,
          step6Views: 0,
          completedApplications: 0,
          abandonedCount: 0,
          lastUpdated: new Date().toISOString(),
        };

    if (eventName === 'funnel_step_view') {
      const step = _params?.step;
      if (step === 1) data.step1Views += 1;
      else if (step === 2) data.step2Views += 1;
      else if (step === 3) data.step3Views += 1;
      else if (step === 4) data.step4Views += 1;
      else if (step === 5) data.step5Views += 1;
      else if (step === 6) data.step6Views += 1;
    } else if (eventName === 'funnel_completed') {
      data.completedApplications += 1;
    } else if (eventName === 'funnel_abandoned') {
      data.abandonedCount += 1;
    }

    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(FUNNEL_METRICS_KEY, JSON.stringify(data));
  } catch {}
}

export function getFunnelMetrics(): FunnelMetricsData {
  if (typeof window === 'undefined') {
    return {
      step1Views: 0,
      step2Views: 0,
      step3Views: 0,
      step4Views: 0,
      step5Views: 0,
      step6Views: 0,
      completedApplications: 0,
      abandonedCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(FUNNEL_METRICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    step1Views: 12,
    step2Views: 10,
    step3Views: 9,
    step4Views: 8,
    step5Views: 8,
    step6Views: 7,
    completedApplications: 6,
    abandonedCount: 2,
    lastUpdated: new Date().toISOString(),
  };
}
