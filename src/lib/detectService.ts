/**
 * Guess which service a visitor means from what they typed, e.g.
 * "need a VPS with cPanel" → Enterprise Hosting, "rank higher on Google" →
 * Digital Marketing. Used by the contact form (pre-selects the service while
 * they type) and by /api/lead (fallback when no service was picked).
 * No imports, so both the website and the API functions can use it.
 */
export type DetectedServiceId = "hosting" | "web-dev" | "mobile" | "branding" | "marketing" | "consulting";

/** Labels exactly as shown on the contact form chips. */
export const DETECT_LABELS: Record<DetectedServiceId, string> = {
  hosting: "Enterprise Hosting",
  "web-dev": "Web Development",
  mobile: "Mobile App",
  branding: "Branding & Design",
  marketing: "Digital Marketing",
  consulting: "Cloud Consulting & Migration",
};

// [pattern, weight, what we tell the visitor we spotted]
type Rule = [RegExp, number, string];

const RULES: Record<DetectedServiceId, Rule[]> = {
  hosting: [
    [/\bvps\b|virtual private server/, 4, "VPS"],
    [/dedicated server|bare[- ]?metal/, 4, "dedicated server"],
    [/shared hosting|reseller hosting/, 4, "shared hosting"],
    [/\bc ?panel\b|\bwhm\b|\bplesk\b/, 4, "control panel"],
    [/web ?hosting|wordpress hosting|email hosting|hosting plan|\bhost(s|ed|ing)?\b/, 3, "hosting"],
    [/\bdomain( name)?s?\b|\bssl\b|\bdns\b|nameserver/, 1, "domain / SSL"],
  ],
  consulting: [
    [/\baws\b|amazon web services|\bec2\b|\bs3\b/, 4, "AWS"],
    [/\bazure\b/, 4, "Azure"],
    [/google cloud|\bgcp\b|bigquery|\bgke\b/, 4, "Google Cloud"],
    [/migrat/, 3, "migration"],
    [/kubernetes|\bk8s\b|\beks\b|\baks\b|terraform|devops|landing zone/, 3, "cloud engineering"],
    [/managed cloud|cloud (cost|bill|spend)|cost optimi[sz]/, 3, "cloud costs"],
    [/\bcloud\b|on[- ]?prem|data ?cent(er|re)/, 2, "cloud"],
    [/\bconsult(ing|ant|ation)?\b|\barchitect/, 1, "consulting"],
  ],
  "web-dev": [
    [/e-?commerce|online (shop|store)|shopify|woocommerce/, 4, "online shop"],
    [/web ?app|web application|\bsaas\b|dashboard|client portal|booking system/, 4, "web app"],
    [/website|web ?site|landing page|redesign|wordpress site|\bwordpress\b/, 3, "website"],
    [/\breact\b|\bnext\.?js\b|front-?end|back-?end|full-?stack|\bapi\b/, 2, "development"],
  ],
  mobile: [
    [/mobile app|\bios\b|android|iphone app|app store|play store|flutter|react native/, 5, "mobile app"],
    [/\bapp\b/, 1, "app"],
  ],
  branding: [
    [/\blogo\b/, 5, "logo"],
    [/brand(ing| identity| guide)|rebrand/, 4, "branding"],
    [/video|animation|motion graphics|explainer/, 3, "video"],
    [/graphic design|business card|flyer|poster|brochure|packaging|stationery/, 3, "design"],
  ],
  marketing: [
    [/\bseo\b|search engine|rank(ing)? (on|in|higher)|first page of google|organic traffic/, 5, "SEO"],
    [/google ads|\bppc\b|adwords|facebook ads|meta ads|linkedin ads|paid ads|ad campaign/, 5, "paid ads"],
    [/social media|instagram|tiktok|facebook page|content calendar/, 4, "social media"],
    [/digital marketing|marketing|more leads|lead generation|email marketing|newsletter/, 3, "marketing"],
  ],
};

export interface DetectedService {
  id: DetectedServiceId;
  label: string;
  /** Short reason shown to the visitor, e.g. "VPS". */
  hint: string;
  score: number;
}

/** Best match for the text, or null if nothing clear (score below 3). */
export function detectService(text: string): DetectedService | null {
  const t = ` ${(text || "").toLowerCase()} `;
  if (t.trim().length < 3) return null;
  let best: DetectedService | null = null;
  for (const id of Object.keys(RULES) as DetectedServiceId[]) {
    let score = 0;
    let hint = "";
    let top = 0;
    for (const [re, w, h] of RULES[id]) {
      if (re.test(t)) {
        score += w;
        if (w > top) {
          top = w;
          hint = h;
        }
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { id, label: DETECT_LABELS[id], hint, score };
  }
  return best && best.score >= 3 ? best : null;
}
