/**
 * Partner (affiliate) program helpers. Nothing is stored outside ClickUp:
 *  - a partner is their application task, tagged "affiliate-partner",
 *    the client tag for their email and "pcode-<code>";
 *  - a referral is any lead/order task tagged "partner-<code>" (added
 *    automatically when the visitor arrived through the partner's link);
 *  - commission status comes from task tags: "paid" (set by the Stripe
 *    webhook or by hand), "commission-approved" and "commission-paid"
 *    (set by hand when you approve or pay a partner).
 */
import crypto from "node:crypto";
import { ENV } from "./env.js";
import { signToken, verifyToken } from "./portal.js";
import { listClientTasks, listTasksByTag, taskTitle, type CuTask } from "./clickup.js";
import { PACKAGE_SERVICES, serviceByLabel } from "../../src/lib/packages.js";
import {
  REFUND_WINDOW_DAYS, commissionFor, levelFor, priceValue, ruleFor,
  type PartnerStats, type Referral, type ReferralStatus,
} from "../../src/lib/affiliates.js";

export const PARTNER_TAG = "affiliate-partner";
export const APPLICATION_PACKAGE = "Affiliate application";
export const partnerTag = (code: string) => `partner-${code}`;
export const codeTag = (code: string) => `pcode-${code}`;

/** Short, readable and unique per email: "sarah-7f3a". */
export function makePartnerCode(name: string, email: string) {
  const first = (name.trim().split(/\s+/)[0] || "partner")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12) || "partner";
  const hash = crypto.createHmac("sha256", ENV.portalSecret || "ego-partner").update(email.trim().toLowerCase()).digest("hex").slice(0, 4);
  return `${first}-${hash}`;
}

export const partnerLink = (code: string, path = "/") => `${ENV.siteUrl}${path}${path.includes("?") ? "&" : "?"}ref=${code}`;

/** The partner's application task (first one, if they applied twice). */
export async function findPartner(email: string): Promise<{ task: CuTask; code: string; name: string } | null> {
  const tasks = (await listClientTasks(email)).filter((t) => (t.tags || []).some((x) => x.name === PARTNER_TAG));
  if (!tasks.length) return null;
  const task = tasks.sort((a, b) => Number(a.date_created || 0) - Number(b.date_created || 0))[0];
  const code = (task.tags || []).map((x) => x.name).find((n) => n.startsWith("pcode-"))?.slice(6);
  if (!code) return null;
  const name = (task.name.split(" — ")[1] || "").replace(/\s*\([^)]*\)\s*/g, " ").trim() || "Partner";
  return { task, code, name };
}

// ---------- Sign-in (separate cookie from the client portal) ----------

const COOKIE = "ego_partner";
const SESSION_DAYS = 30;

export const partnerLoginToken = (email: string, ttlSec: number) => signToken(email, "plogin", ttlSec);
export const verifyPartnerLogin = (token: string) => verifyToken(token, "plogin");

export function partnerSessionCookie(email: string) {
  const token = signToken(email, "psession", SESSION_DAYS * 86400);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearPartnerCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export function partnerSessionEmail(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return verifyToken(m?.[1], "psession");
}

// ---------- Referrals ----------

const DAY = 86400 * 1000;

/** "Cloud Migration — Sarah Ahmed (Acme Ltd) (EGO-…)" → "S**** A**** (A*** L**)": partners never see full client names. */
function maskedClient(taskName: string) {
  const who = (taskName.split(" — ")[1] || "Client").replace(/\s*\((?:EGO|SUP)-[^)]*\)\s*$/, "");
  return who.replace(/[\p{L}\p{N}]+/gu, (w) => w[0] + "*".repeat(Math.max(1, Math.min(w.length - 1, 6))));
}

function field(t: CuTask, label: string) {
  const text = `${t.markdown_description || ""}\n${t.text_content || ""}`;
  return text.match(new RegExp(`${label}:\\**\\s*([^\\n]+)`, "i"))?.[1].replace(/\*+/g, "").trim();
}

/** Service, package and price for a lead task, from its description and the price list. */
function dealOf(t: CuTask) {
  const pkgLine = field(t, "Package") || "";
  const pkgName = pkgLine.replace(/\s*\(.*\)\s*$/, "").trim() || taskTitle(t.name);
  const services = (field(t, "Services") || "").split(",").map((s) => s.trim()).filter(Boolean);
  let serviceId: string | undefined;
  let value: number | null = null;
  for (const svc of PACKAGE_SERVICES) {
    const p = svc.packages.find((x) => x.name.toLowerCase() === pkgName.toLowerCase());
    if (p) {
      serviceId = svc.id;
      value = priceValue(p.price);
      break;
    }
  }
  if (!serviceId && services[0]) serviceId = serviceByLabel(services[0])?.id;
  // A price written on the task ("Package: Custom ($12,000)" or "Deal value: $12,000") wins over the list price.
  const written = (pkgLine.match(/\(\s*\$([\d,.]+)/) || [])[1] || (field(t, "Deal value") || "").replace(/[^\d.]/g, "");
  if (written && Number(written.replace(/,/g, "")) > 0) value = Number(written.replace(/,/g, ""));
  const rule = ruleFor(serviceId);
  return { serviceId, rule, pkgName, serviceLabel: rule?.label || services[0] || "Other", value };
}

function statusOf(t: CuTask, paid: boolean): ReferralStatus {
  const tags = (t.tags || []).map((x) => x.name);
  const s = (t.status?.status || "").toLowerCase();
  if (tags.includes("commission-paid")) return "Paid out";
  if (/lost|cancel|reject|declin|spam/.test(s)) return "Lost";
  if (paid) {
    const age = Date.now() - Number(t.date_updated || t.date_created || Date.now());
    return tags.includes("commission-approved") || age > REFUND_WINDOW_DAYS * DAY ? "Approved" : "Paid";
  }
  if (/quot|proposal|negotiat|review/.test(s)) return "Quoted";
  return "Lead";
}

const isPaid = (t: CuTask) => {
  const tags = (t.tags || []).map((x) => x.name);
  return tags.includes("paid") || tags.includes("commission-approved") || tags.includes("commission-paid") || /complete|deliver|done|won/.test((t.status?.status || "").toLowerCase());
};

export async function partnerReferrals(code: string): Promise<{ referrals: Referral[]; stats: PartnerStats }> {
  const tasks = (await listTasksByTag(partnerTag(code)))
    .filter((t) => !(t.tags || []).some((x) => x.name === PARTNER_TAG))
    .sort((a, b) => Number(a.date_created || 0) - Number(b.date_created || 0));

  let paidSoFar = 0;
  const yearAgo = Date.now() - 365 * DAY;
  const referrals: Referral[] = tasks.map((t) => {
    const deal = dealOf(t);
    const paid = isPaid(t);
    const status = statusOf(t, paid);
    // Each paying client earns at the level reached by the paying clients before it.
    const level = levelFor(paidSoFar);
    if (paid && status !== "Lost") paidSoFar++;
    const commission = deal.rule && deal.value ? commissionFor(deal.rule, deal.value, level) : null;
    return {
      id: t.id,
      date: new Date(Number(t.date_created || Date.now())).toISOString(),
      client: maskedClient(t.name),
      service: deal.serviceLabel,
      pkg: deal.pkgName,
      value: deal.value,
      recurring: deal.rule?.type === "recurring",
      commission,
      status,
    };
  });

  const sum = (s: ReferralStatus) => referrals.filter((r) => r.status === s).reduce((a, r) => a + (r.commission || 0), 0);
  const paidClients = referrals.filter((r) => ["Paid", "Approved", "Paid out"].includes(r.status) && Date.parse(r.date) > yearAgo).length;
  const stats: PartnerStats = {
    leads: referrals.length,
    paidClients,
    level: levelFor(paidClients).id,
    pending: sum("Paid"),
    approved: sum("Approved"),
    paidOut: sum("Paid out"),
    potential: sum("Lead") + sum("Quoted"),
  };
  return { referrals: referrals.reverse(), stats };
}

