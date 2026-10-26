/**
 * Paid-ads tracking: Google Ads (covers YouTube), Meta (Facebook + Instagram)
 * and LinkedIn. Paste your IDs below; anything left empty is simply not loaded.
 *
 *  - Google Ads:  Google Ads → Goals → Conversions → create "Lead" and "Booked call"
 *                 conversions → "Use Google tag" → copy AW-XXXXXXXXX and each label.
 *  - Meta Pixel:  Events Manager → Data sources → your pixel ID (15–16 digits).
 *  - LinkedIn:    Campaign Manager → Analyze → Insight Tag → partner ID, then
 *                 Conversions → create "Lead" / "Booked call" → copy each conversion ID.
 */
export const ADS = {
  googleAdsId: '', // e.g. 'AW-123456789'
  googleAdsLeadLabel: '', // e.g. 'AbCdEfGhIjKlMnOp'
  googleAdsBookingLabel: '',
  metaPixelId: '', // e.g. '123456789012345'
  linkedInPartnerId: '', // e.g. '1234567'
  linkedInLeadConversionId: 0, // e.g. 12345678
  linkedInBookingConversionId: 0,
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    lintrk?: ((...args: unknown[]) => void) & { q?: unknown[] };
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  }
}

/* ---------------- Attribution (UTMs + click IDs) ---------------- */

const ATTR_KEY = 'ego_attribution';
const ATTR_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'li_fat_id'] as const;
export type Attribution = Partial<Record<(typeof ATTR_PARAMS)[number] | 'landing_page' | 'referrer', string>>;

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Saves the ad click details on arrival (last paid click wins, kept 30 days). */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const found: Attribution = {};
  for (const k of ATTR_PARAMS) {
    const v = params.get(k);
    if (v) found[k] = v.slice(0, 200);
  }
  const store = safeStorage();
  if (!Object.keys(found).length) {
    // Organic visit: only record the first landing page if nothing is stored yet.
    if (store && !store.getItem(ATTR_KEY)) {
      const ref = document.referrer && !document.referrer.includes(window.location.host) ? document.referrer : '';
      store.setItem(ATTR_KEY, JSON.stringify({ v: { landing_page: window.location.pathname, referrer: ref.slice(0, 200) }, t: Date.now() }));
    }
    return;
  }
  found.landing_page = window.location.pathname;
  store?.setItem(ATTR_KEY, JSON.stringify({ v: found, t: Date.now() }));
}

export function getAttribution(): Attribution {
  try {
    const raw = safeStorage()?.getItem(ATTR_KEY);
    if (!raw) return {};
    const { v, t } = JSON.parse(raw);
    if (Date.now() - t > 30 * 24 * 3600 * 1000) return {};
    return v || {};
  } catch {
    return {};
  }
}

/** One-line summary added to form submissions so each lead shows where it came from. */
export function attributionSummary(): string {
  const a = getAttribution();
  const clickId = a.gclid ? 'gclid' : a.gbraid ? 'gbraid' : a.wbraid ? 'wbraid' : a.fbclid ? 'fbclid' : a.li_fat_id ? 'li_fat_id' : '';
  const parts = [
    a.utm_source && `source=${a.utm_source}`,
    a.utm_medium && `medium=${a.utm_medium}`,
    a.utm_campaign && `campaign=${a.utm_campaign}`,
    a.utm_content && `ad=${a.utm_content}`,
    a.utm_term && `keyword=${a.utm_term}`,
    clickId && `click=${clickId}`,
    !a.utm_source && a.referrer && `referrer=${a.referrer}`,
    a.landing_page && `landing=${a.landing_page}`,
  ].filter(Boolean);
  return parts.length ? `[Source: ${parts.join(', ')}]` : '';
}

/* ---------------- Consent ---------------- */

const CONSENT_KEY = 'ego_consent';
export type ConsentState = 'granted' | 'denied' | null;

/** Opt-in is required for visitors in Europe (GDPR/UK GDPR); elsewhere tracking runs by default with an opt-out. */
export function consentRequired(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith('Europe/');
  } catch {
    return false;
  }
}

export function getConsent(): ConsentState {
  const v = safeStorage()?.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function marketingAllowed(): boolean {
  const c = getConsent();
  if (c) return c === 'granted';
  return !consentRequired();
}

export function setConsent(state: 'granted' | 'denied') {
  safeStorage()?.setItem(CONSENT_KEY, state);
  window.gtag?.('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
  if (state === 'granted') loadAdPixels();
  window.dispatchEvent(new Event('ego-consent-change'));
}

/* ---------------- Pixel loaders ---------------- */

let pixelsLoaded = false;
let lastPageViewPath = '';

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function loadAdPixels() {
  if (pixelsLoaded || typeof window === 'undefined' || !marketingAllowed()) return;
  pixelsLoaded = true;

  if (ADS.googleAdsId) {
    // gtag.js is already on the page (GA4); just add the Ads destination.
    window.gtag?.('config', ADS.googleAdsId);
  }

  if (ADS.metaPixelId && !window.fbq) {
    const n: any = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    };
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
    window._fbq = n;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    n('init', ADS.metaPixelId);
    n('track', 'PageView');
    lastPageViewPath = window.location.pathname;
  }

  if (ADS.linkedInPartnerId && !window.lintrk) {
    window._linkedin_partner_id = ADS.linkedInPartnerId;
    window._linkedin_data_partner_ids = [ADS.linkedInPartnerId];
    const l: any = function (a: unknown, b: unknown) {
      l.q.push([a, b]);
    };
    l.q = [];
    window.lintrk = l;
    loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
  }
}

/** Called on client-side route changes so Meta counts every page view. */
export function adsPageView() {
  if (!pixelsLoaded || window.location.pathname === lastPageViewPath) return;
  lastPageViewPath = window.location.pathname;
  window.fbq?.('track', 'PageView');
  // LinkedIn's Insight Tag tracks SPA navigation automatically.
}

/* ---------------- Conversion events ---------------- */

type Conversion = 'lead' | 'booking' | 'contact' | 'view_content';

export function adsConversion(kind: Conversion, data: Record<string, unknown> = {}) {
  if (!pixelsLoaded) return;
  const eventId = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (kind === 'lead') {
    if (ADS.googleAdsId && ADS.googleAdsLeadLabel)
      window.gtag?.('event', 'conversion', { send_to: `${ADS.googleAdsId}/${ADS.googleAdsLeadLabel}` });
    window.fbq?.('track', 'Lead', data, { eventID: eventId });
    if (ADS.linkedInLeadConversionId) window.lintrk?.('track', { conversion_id: ADS.linkedInLeadConversionId });
  } else if (kind === 'booking') {
    if (ADS.googleAdsId && ADS.googleAdsBookingLabel)
      window.gtag?.('event', 'conversion', { send_to: `${ADS.googleAdsId}/${ADS.googleAdsBookingLabel}` });
    window.fbq?.('track', 'Schedule', data, { eventID: eventId });
    if (ADS.linkedInBookingConversionId) window.lintrk?.('track', { conversion_id: ADS.linkedInBookingConversionId });
  } else if (kind === 'contact') {
    window.fbq?.('track', 'Contact', data);
  } else if (kind === 'view_content') {
    window.fbq?.('track', 'ViewContent', data);
  }
}
