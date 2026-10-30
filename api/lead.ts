/**
 * POST /api/lead: called by the contact form right after MailerLite accepts
 * a submission (the MailerLite form itself is unchanged).
 *
 * 1. Creates a ClickUp task for the request
 * 2. Fixed-price package → creates a Stripe payment link and returns it, so
 *    the page sends the client straight to payment (no approval needed)
 * Then, after the response (so the redirect is instant):
 * 3. Client email from notifications@: fixed package → AI-written "request
 *    received + what you'll get" with the payment button; otherwise the
 *    standard confirmation
 * 4. Slack: fixed package → "auto-handled"; custom/quote → AI-drafted reply
 *    with Send / Edit & send buttons (a human sends it, /api/slack/actions)
 * 5. Copy to the team inbox (info@) with all details (+ the AI draft)
 */
import { waitUntil } from "@vercel/functions";
import { ENV, has, log } from "./_lib/env.js";
import { createLeadTask, commentOnTask, taskUrl } from "./_lib/clickup.js";
import { platformTag } from "./_lib/portal.js";
import { createPaymentLink, formatMoney } from "./_lib/stripe.js";
import { sendNotification, sendTeamCopy } from "./_lib/email.js";
import { confirmationEmail, fixedOrderEmail, teamCopyEmail } from "./_lib/templates.js";
import { draftReply, writeFixedEmail } from "./_lib/ai.js";
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
    // Fixed-price packages are orders awaiting payment; hosting becomes a portal "service" once paid.
    const tags = checkout
      ? ["website-lead", "order", "awaiting-payment", ...(checkout.mode === "subscription" ? ["service", platformTag(lead.message)] : [])]
      : undefined;
    task = await createLeadTask(lead, { priceLabel, ...(tags ? { tags, title: pkg?.name } : {}) });
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

  // 3-5 run after the response, so a fixed-package client is redirected to payment right away.
  waitUntil(
    notify({ lead, task, paymentUrl, priceLabel, packageLabel, fixed: Boolean(checkout && service && pkg), serviceId: service?.id, serviceTitle: service?.title }).catch((err) =>
      log("notify_failed", { ref: lead.ref, error: String(err) }),
    ),
  );

  return json(200, { ok: true, ref: lead.ref, paymentUrl: paymentUrl || null });
}

async function notify(o: {
  lead: Lead;
  task: { id: string; url: string } | null;
  paymentUrl?: string;
  priceLabel?: string;
  packageLabel?: string;
  fixed: boolean;
  serviceId?: string;
  serviceTitle?: string;
}) {
  const { lead, task, paymentUrl, priceLabel, packageLabel } = o;

  // 3. Client email (notifications@)
  if (o.fixed && packageLabel && priceLabel) {
    const body = await writeFixedEmail("order_received", {
      lead, serviceId: o.serviceId || "", serviceTitle: o.serviceTitle || "", packageName: packageLabel, priceLabel, paymentReady: Boolean(paymentUrl),
    });
    const mail = fixedOrderEmail(lead.ref, body.text, { packageLabel, priceLabel, paymentUrl });
    await sendNotification(lead.email, mail.subject, mail.html, mail.text);
    await commentOnTask(task?.id, `🤖 ${body.ai ? "AI-written" : "Standard"} "request received" email sent to the client from notifications@.`);
  } else {
    const mail = confirmationEmail(lead, { packageLabel });
    await sendNotification(lead.email, mail.subject, mail.html, mail.text);
  }

  // 4. Slack: auto-handled, or an AI draft for a human to approve and send
  const draft = paymentUrl ? undefined : await draftReply(lead);
  if (has.slack()) {
    try {
      if (paymentUrl && priceLabel) {
        await postMessage(autoBlocks(lead, paymentUrl, priceLabel, taskUrl(task?.id)), `New request from ${lead.name} (auto-handled)`);
      } else if (draft) {
        await postMessage(
          draftBlocks(lead, draft.text, { r: lead.ref, e: lead.email, n: lead.name, t: task?.id, s: packageLabel || lead.services[0] }, taskUrl(task?.id), draft.ai),
          `New request from ${lead.name}: reply draft ready`,
        );
      }
    } catch (err) {
      log("slack_failed", { ref: lead.ref, error: String(err) });
    }
  }

  // 5. Team inbox copy (info@)
  const copy = teamCopyEmail({
    kind: "lead",
    ref: lead.ref,
    title: packageLabel || lead.services.join(", ") || "General enquiry",
    clientName: lead.name,
    clientEmail: lead.email,
    rows: [
      ["Name", lead.name],
      ["Email", lead.email],
      ["Company", lead.company],
      ["Phone", lead.phone],
      ["Country", lead.country],
      ["Services", lead.services.join(", ") || undefined],
      ["Package", packageLabel ? `${packageLabel}${priceLabel ? ` (${priceLabel})` : ""}` : undefined],
      ["Timeline", lead.timeline],
      ["Source", lead.source],
      ["Page", lead.page],
    ],
    message: lead.message,
    taskId: task?.id,
    status: paymentUrl
      ? `Fixed-price package: client sent straight to Stripe payment (${priceLabel}) and emailed the payment link automatically. Nothing to approve.`
      : o.fixed
        ? "Fixed-price package, but Stripe isn't connected, so no payment link was created. Send a price from Slack (Edit, add price & send)."
        : "Confirmation sent to the client. Reply draft below is waiting for a human to review and send.",
    draft,
  });
  await sendTeamCopy(copy.subject, copy.html, copy.text, lead.email);
}
