/**
 * Affiliate program: the single place to change commission rates, partner
 * levels and rules. The /affiliates page, the earnings calculator and the
 * partner dashboard all read from here.
 */
import { PACKAGE_SERVICES as SERVICES } from "./packages";

export const REF_PARAM = "ref";
export const COOKIE_DAYS = 90;
export const MIN_PAYOUT = 50;
export const REFUND_WINDOW_DAYS = 30;
export const MAX_COMMISSION_PER_CLIENT = 5000;

/** Partner levels, based on paid clients referred in the last 12 months. */
export interface Level {
  id: "partner" | "pro" | "elite";
  name: string;
  minClients: number;
  /** Percentage points added to every service's base rate. */
  bonus: number;
  perks: string[];
}

export const LEVELS: Level[] = [
  { id: "partner", name: "Partner", minClients: 0, bonus: 0, perks: ["Full commission on every service", "Personal referral links and dashboard", "Monthly payouts"] },
  { id: "pro", name: "Pro", minClients: 3, bonus: 3, perks: ["+3% on every service", "Co-branded proposals for your clients", "Priority quotes within 1 business day"] },
  { id: "elite", name: "Elite", minClients: 10, bonus: 5, perks: ["+5% on every service", "Dedicated partner manager", "Payouts twice a month"] },
];

/**
 * How each service pays.
 * - "project": % of the client's first project (or first invoice for custom work)
 * - "recurring": % of each monthly payment for `months` months
 */
export interface CommissionRule {
  serviceId: string;
  label: string;
  short: string;
  rate: number;
  type: "project" | "recurring";
  months?: number;
  pitch: string;
}

export const COMMISSIONS: CommissionRule[] = [
  { serviceId: "consulting", label: "Cloud Consulting & Migration", short: "Cloud", rate: 10, type: "project", pitch: "Businesses moving to Google Cloud, AWS or Azure, or overpaying for the cloud they have." },
  { serviceId: "hosting", label: "Managed Hosting", short: "Hosting", rate: 30, type: "recurring", months: 12, pitch: "Anyone who needs fast, managed hosting, a VPS or a dedicated server." },
  { serviceId: "web-dev", label: "Web Development", short: "Web", rate: 12, type: "project", pitch: "Companies that need a new website, web app or online shop." },
  { serviceId: "mobile", label: "Mobile App Development", short: "Apps", rate: 10, type: "project", pitch: "Startups and businesses planning an iOS or Android app." },
  { serviceId: "branding", label: "Branding & Design", short: "Branding", rate: 15, type: "project", pitch: "New businesses and rebrands: logos, brand identity and design systems." },
  { serviceId: "marketing", label: "Digital Marketing", short: "Marketing", rate: 10, type: "recurring", months: 6, pitch: "Businesses that want more leads from SEO, social media and paid ads." },
];

export function levelFor(paidClients: number): Level {
  return [...LEVELS].reverse().find((l) => paidClients >= l.minClients) || LEVELS[0];
}

export function nextLevel(level: Level): Level | undefined {
  return LEVELS[LEVELS.findIndex((l) => l.id === level.id) + 1];
}

/** Package price in dollars from the Pricing data ("$1,500" → 1500); custom packages return null. */
export function priceValue(price: string): number | null {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Packages with a list price, per service, for the calculator and the commission table. */
export function pricedPackages(serviceId: string) {
  const svc = SERVICES.find((s) => s.id === serviceId);
  return (svc?.packages || [])
    .map((p) => ({ name: p.name, price: priceValue(p.price), billing: p.billing.trim() }))
    .filter((p): p is { name: string; price: number; billing: string } => p.price !== null);
}

/** Total commission for one referred client on a package (at the package's starting price). */
export function commissionFor(rule: CommissionRule, price: number, level: Level = LEVELS[0]): number {
  const pct = (rule.rate + level.bonus) / 100;
  const total = rule.type === "recurring" ? price * pct * (rule.months || 1) : price * pct;
  return Math.min(Math.round(total * 100) / 100, MAX_COMMISSION_PER_CLIENT);
}

export function rateText(rule: CommissionRule, level: Level = LEVELS[0]) {
  const r = rule.rate + level.bonus;
  return rule.type === "recurring" ? `${r}% monthly for ${rule.months} months` : `${r}% of the project`;
}

export const money = (n: number, cents = false) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

/** Pages partners can link to from the dashboard's link builder. */
export const LINK_TARGETS = [
  { path: "/", label: "Homepage" },
  { path: "/services", label: "All services" },
  { path: "/google-cloud", label: "Google Cloud" },
  { path: "/hosting", label: "Managed hosting" },
  { path: "/web-development", label: "Web development" },
  { path: "/mobile-app-development", label: "Mobile apps" },
  { path: "/branding-design", label: "Branding & design" },
  { path: "/digital-marketing", label: "Digital marketing" },
  { path: "/free-cloud-cost-review", label: "Free cloud cost review" },
  { path: "/free-website-check", label: "Free website check" },
  { path: "/pricing", label: "Pricing" },
];

export const RULES = [
  `Your link is remembered for ${COOKIE_DAYS} days. If the client buys within that time, the referral is yours.`,
  "The first partner whose link the client used gets the referral.",
  `Commission is approved once the client has paid and the ${REFUND_WINDOW_DAYS}-day refund window has passed.`,
  `Payouts go out monthly by bank transfer, Wise or Stripe once your approved balance reaches ${money(MIN_PAYOUT)}.`,
  `Commission is capped at ${money(MAX_COMMISSION_PER_CLIENT)} per referred client.`,
  "No self-referrals, spam, fake reviews or misleading claims about our services.",
  "Don't bid on \"EGO Web Services\" or our brand name in search ads.",
];
