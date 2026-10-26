/**
 * POST /api/lead: called by the contact form right after MailerLite accepts
 * a submission (the MailerLite form itself is unchanged).
 *
 * 1. Creates a ClickUp task for the request
 * 2. Fixed-price package → creates a Stripe payment link
 * 3. Emails the client an instant branded confirmation (+ payment link if any)
 * 4. Posts the lead to Slack: either "auto-handled", or an AI-drafted reply
 *    with Send / Edit & send buttons (handled by /api/slack/actions)
 */
import { ENV, has, log } from "./_lib/env.js";
import { createLeadTask, commentOnTask, taskUrl } from "./_lib/clickup.js";
import { createPaymentLink, formatMoney } from "./_lib/stripe.js";
import { sendEmail } from "./_lib/email.js";
import { confirmationEmail } from "./_lib/templates.js";
import { draftReply } from "./_lib/ai.js";
import { autoBlocks, draftBlocks, postMessage } from "./_lib/slack.js";
import { findPackage, serviceByLabel } from "../src/lib/packages.js";
import type { Lead } from "./_lib/types.js";

const hits = new Map<string, number[]>();
function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function originAllowed(origin: string | null) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ENV.allowedOrigins.includes(origin) || host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function makeRef() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `EGO-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export async function POST(request: Request) {
  if (!originAllowed(request.headers.get("origin"))) return json(403, { ok: false, error: "forbidden" });
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(`ip:${ip}`, 8, 60 * 60 * 1000)) return json(429, { ok: false, error: "too_many_requests" });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const email = str(body.email, 200).toLowerCase();
  const name = str(body.name, 120);
  const message = str(body.message, 5000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !name || !message) return json(400, { ok: false, error: "missing_fields" });
  if (rateLimited(`email:${email}`, 3, 30 * 60 * 1000)) return json(429, { ok: false, error: "too_many_requests" });

  const services = Array.isArray(body.services) ? body.services.map((s) => str(s, 60)).filter(Boolean).slice(0, 6) : [];
  const [pkgPart, timelinePart] = str(body.package, 120).split(" · ");
  const serviceId = str(body.serviceId, 40) || (services[0] ? serviceByLabel(services[0])?.id : undefined) || undefined;

  const lead: Lead = {
    ref: makeRef(),
    name,
    email,
    company: str(body.company, 120) || undefined,
    phone: str(body.phone, 40) || undefined,
    country: str(body.country, 60) || undefined,
    message,
    services,
    serviceId,
    packageName: pkgPart || undefined,
    timeline: timelinePart || undefined,
    source: str(body.source, 300) || undefined,
    page: str(body.page, 200) || undefined,
    receivedAt: new Date().toISOString(),
  };
  log("lead_received", { ref: lead.ref, services, package: lead.packageName });

  // Fixed-price package?
  const { service, pkg } = findPackage(serviceId, lead.packageName);
  const checkout = pkg?.checkout;
  const priceLabel = checkout ? `${formatMoney(checkout.amountCents)}${checkout.mode === "subscription" ? "/month" : ""}` : undefined;
  const packageLabel = pkg ? pkg.name : lead.packageName;

  // 1. ClickUp
  let task: { id: string; url: string } | null = null;
  try {
    task = await createLeadTask(lead, { priceLabel });
  } catch (err) {
    log("clickup_failed", { ref: lead.ref, error: String(err) });
  }

  // 2. Stripe payment link (fixed-price packages only)
  let paymentUrl: string | undefined;
  if (checkout && service && pkg) {
    try {
      paymentUrl =
        (await createPaymentLink({
          ref: lead.ref,
          email,
          productName: `EGO Web Services: ${service.title}, ${pkg.name}`,
          amountCents: checkout.amountCents,
          mode: checkout.mode,
          interval: checkout.interval,
          lookupKey: `ego_${slug(service.id)}_${slug(pkg.name)}`,
          clickupTaskId: task?.id,
        })) || undefined;
      if (paymentUrl) await commentOnTask(task?.id, `💳 Stripe payment link sent automatically (${priceLabel}): ${paymentUrl}`);
    } catch (err) {
      log("stripe_failed", { ref: lead.ref, error: String(err) });
    }
  }

  // 3. Instant confirmation to the client
  const mail = confirmationEmail(lead, { paymentUrl, priceLabel, packageLabel });
  await sendEmail(email, mail.subject, mail.html, mail.text, ENV.internalNotifyEmail || undefined).catch((err) =>
    log("email_failed", { ref: lead.ref, error: String(err) }),
  );

  // 4. Slack
  if (has.slack()) {
    try {
      if (paymentUrl && priceLabel) {
        await postMessage(autoBlocks(lead, paymentUrl, priceLabel, taskUrl(task?.id)), `New request from ${lead.name} (auto-handled)`);
      } else {
        const draft = await draftReply(lead);
        await postMessage(
          draftBlocks(lead, draft.text, { r: lead.ref, e: email, n: name, t: task?.id, s: packageLabel || lead.services[0] }, taskUrl(task?.id), draft.ai),
          `New request from ${lead.name}: reply draft ready`,
        );
      }
    } catch (err) {
      log("slack_failed", { ref: lead.ref, error: String(err) });
    }
  }

  return json(200, { ok: true, ref: lead.ref, paymentUrl: paymentUrl || null });
}
