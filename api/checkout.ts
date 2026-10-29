/**
 * POST /api/checkout: "Buy now" for fixed-price packages.
 * Validates the order form, creates a ClickUp task (tagged order +
 * awaiting-payment), opens a Stripe Checkout Session and alerts Slack.
 * /api/stripe/webhook marks the order paid when Stripe confirms payment.
 */
import { ENV, has, log } from "./_lib/env.js";
import { createLeadTask, taskUrl } from "./_lib/clickup.js";
import { createCheckoutSession, formatMoney } from "./_lib/stripe.js";
import { postMessage } from "./_lib/slack.js";
import { clientIp, json, rateLimited, sameOrigin } from "./_lib/portal.js";
import { ORDER_FIELDS, findCheckoutPackage } from "../src/lib/checkout.js";
import type { Lead } from "./_lib/types.js";

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function makeRef() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `EGO-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X")}`;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: "forbidden" });
  if (!has.stripe()) return json(503, { ok: false, error: "Online payment isn't available right now. Please use the contact form." });
  if (rateLimited(`co:${clientIp(request)}`, 10, 60 * 60 * 1000)) return json(429, { ok: false, error: "Too many attempts. Please try again later." });

  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  if (str(b.website)) return json(200, { ok: true, url: `${ENV.siteUrl}/thank-you` }); // honeypot

  const found = findCheckoutPackage(str(b.service, 40), str(b.package, 80));
  if (!found) return json(400, { ok: false, error: "This package can't be bought online. Please request a quote instead." });
  const { service, pkg } = found;
  const checkout = pkg.checkout!;

  const name = str(b.name, 120);
  const email = str(b.email, 200).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { ok: false, error: "Please enter your name and a valid email." });
  if (b.terms !== true) return json(400, { ok: false, error: "Please accept the terms to continue." });

  const fields = ORDER_FIELDS[service.id] || [];
  const raw = (b.details && typeof b.details === "object" ? b.details : {}) as Record<string, unknown>;
  const details: [string, string][] = [];
  for (const f of fields) {
    const v = str(raw[f.id], f.type === "textarea" ? 3000 : 200);
    if (f.required && !v) return json(400, { ok: false, error: `Please fill in: ${f.label}` });
    if (f.type === "select" && v && f.options && !f.options.includes(v)) return json(400, { ok: false, error: `Please choose an option for: ${f.label}` });
    if (v) details.push([f.label, v]);
  }
  const notes = str(b.notes, 3000);

  const price = `${formatMoney(checkout.amountCents)}${checkout.mode === "subscription" ? "/month" : ""}`;
  const ref = makeRef();
  const lead: Lead = {
    ref,
    name,
    email,
    company: str(b.company, 120) || undefined,
    phone: str(b.phone, 40) || undefined,
    country: str(b.country, 60) || undefined,
    message: notes || "(No extra notes)",
    services: [service.title],
    serviceId: service.id,
    packageName: pkg.name,
    source: str(b.source, 300) || undefined,
    page: "/checkout",
    receivedAt: new Date().toISOString(),
  };
  log("order_started", { ref, service: service.id, package: pkg.name });

  let task: { id: string; url: string } | null = null;
  try {
    task = await createLeadTask(lead, { priceLabel: price, title: pkg.name, tags: ["website-order", "order", "awaiting-payment"], details: [["Order", `${pkg.name} (${price})`], ...details] });
  } catch (err) {
    log("clickup_failed", { ref, error: String(err) });
  }

  let url: string;
  try {
    url = await createCheckoutSession({
      ref,
      email,
      productName: `EGO Web Services: ${service.title}, ${pkg.name}`,
      amountCents: checkout.amountCents,
      mode: checkout.mode,
      interval: checkout.interval,
      lookupKey: `ego_${slug(service.id)}_${slug(pkg.name)}`,
      clickupTaskId: task?.id,
      successUrl: `${ENV.siteUrl}/thank-you?paid=1&ref=${encodeURIComponent(ref)}`,
      cancelUrl: `${ENV.siteUrl}/checkout?service=${encodeURIComponent(service.id)}&package=${encodeURIComponent(pkg.name)}&canceled=1`,
    });
  } catch (err) {
    log("stripe_checkout_failed", { ref, error: String(err) });
    return json(502, { ok: false, error: "We couldn't open the secure payment page. Please try again in a minute or contact us." });
  }

  if (has.slack()) {
    const tUrl = taskUrl(task?.id);
    const lines = [
      `*Client*\n${name}${lead.company ? ` · ${lead.company}` : ""}\n${email}${lead.phone ? ` · ${lead.phone}` : ""}${lead.country ? ` · ${lead.country}` : ""}`,
      ...details.map(([k, v]) => `*${k}*\n${v.slice(0, 500)}`),
      notes ? `*Notes*\n${notes.slice(0, 800)}` : "",
    ].filter(Boolean);
    await postMessage(
      [
        { type: "header", text: { type: "plain_text", text: `🛒 New order: ${pkg.name} (${ref})` } },
        { type: "section", text: { type: "mrkdwn", text: lines.join("\n\n").slice(0, 2900) } },
        { type: "context", elements: [{ type: "mrkdwn", text: `⏳ Awaiting payment of *${price}* on Stripe. You'll get a 💰 message here when it's paid.` }] },
        ...(tUrl ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url: tUrl }] }] : []),
      ],
      `New order: ${pkg.name} from ${name} (awaiting payment)`,
    ).catch((err) => log("slack_failed", { ref, error: String(err) }));
  }

  return json(200, { ok: true, ref, url });
}
