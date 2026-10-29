/**
 * /api/portal?action=… : client portal (portal.egowebservices.com).
 *   POST login    {email}        → emails a magic sign-in link (always answers ok)
 *   POST session  {token}        → exchanges the link token for a 30-day session cookie
 *   GET  me                      → {email} for the signed-in client
 *   POST logout
 *   GET  orders                  → the client's orders (ClickUp tasks tagged with their email)
 *   GET  order    ?id=           → one order: stage, messages, files
 *   POST message  {id, text}     → client message → ClickUp comment + Slack
 *   POST upload   ?id= (multipart "file") → attaches the file to the ClickUp task + Slack
 *   POST billing                 → Stripe billing portal link (invoices, cards, subscriptions)
 * Orders are read live from ClickUp; nothing else is stored.
 */
import { ENV, has, log } from "./_lib/env.js";
import { addTag, commentOnTask, getClientTask, getComments, listClientTasks, taskUrl, uploadAttachment } from "./_lib/clickup.js";
import { billingPortalUrl, findCustomerId } from "./_lib/stripe.js";
import { postMessage } from "./_lib/slack.js";
import { sendEmail } from "./_lib/email.js";
import { magicLinkEmail } from "./_lib/templates.js";
import {
  clearCookie, clientIp, clientMessages, json, orderSummary, rateLimited, sameOrigin, sessionCookie, sessionEmail, signToken, verifyToken,
} from "./_lib/portal.js";

const MAX_FILE = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies
const ALLOWED = /\.(pdf|png|jpe?g|gif|webp|svg|ai|eps|psd|zip|docx?|xlsx?|pptx?|txt|csv|md)$/i;

async function slackNote(text: string, taskId?: string) {
  if (!has.slack()) return;
  const url = taskUrl(taskId);
  await postMessage(
    [
      { type: "section", text: { type: "mrkdwn", text: text.slice(0, 2900) } },
      ...(url ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url }] }] : []),
      { type: "context", elements: [{ type: "mrkdwn", text: "Reply in ClickUp with a comment starting *To client:* and they'll get it by email and in the portal." }] },
    ],
    text.slice(0, 150),
  ).catch((err) => log("slack_failed", { error: String(err) }));
}

async function handle(request: Request, method: "GET" | "POST") {
  if (!has.portal()) return json(503, { ok: false, error: "The client portal isn't set up yet." });
  if (!sameOrigin(request)) return json(403, { ok: false, error: "forbidden" });
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";
  const ip = clientIp(request);

  // ----- public actions -----
  if (method === "POST" && action === "login") {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { ok: false, error: "Please enter a valid email." });
    if (rateLimited(`pl:${ip}`, 10, 3600_000) || rateLimited(`pe:${email}`, 4, 3600_000)) {
      return json(429, { ok: false, error: "Too many sign-in requests. Please wait a few minutes." });
    }
    const link = `${ENV.portalUrl}/portal?token=${encodeURIComponent(signToken(email, "login", 20 * 60))}`;
    const mail = magicLinkEmail(link);
    await sendEmail(email, mail.subject, mail.html, mail.text).catch((err) => log("portal_login_email_failed", { error: String(err) }));
    log("portal_login_requested", { email });
    return json(200, { ok: true }); // same answer whether or not the email has orders
  }

  if (method === "POST" && action === "session") {
    const body = await request.json().catch(() => ({}));
    const email = verifyToken(String(body.token || ""), "login");
    if (!email) return json(401, { ok: false, error: "This sign-in link has expired or was already replaced. Please request a new one." });
    return json(200, { ok: true, email }, { "Set-Cookie": sessionCookie(email) });
  }

  if (method === "POST" && action === "logout") return json(200, { ok: true }, { "Set-Cookie": clearCookie() });

  // ----- signed-in actions -----
  const email = sessionEmail(request);
  if (!email) return json(401, { ok: false, error: "signed_out" });

  if (method === "GET" && action === "me") return json(200, { ok: true, email });

  if (method === "GET" && action === "orders") {
    try {
      const tasks = await listClientTasks(email);
      const orders = tasks.map(orderSummary).sort((a, b) => (b.created || 0) - (a.created || 0));
      return json(200, { ok: true, email, orders });
    } catch (err) {
      log("portal_orders_failed", { error: String(err) });
      return json(502, { ok: false, error: "We couldn't load your orders right now. Please try again shortly." });
    }
  }

  if (method === "GET" && action === "order") {
    const task = await getClientTask(url.searchParams.get("id") || "", email);
    if (!task) return json(404, { ok: false, error: "Order not found." });
    const comments = await getComments(task.id).catch(() => []);
    const files = (task.attachments || []).map((a) => ({ id: a.id, name: a.title || "File", url: a.url, size: a.size, date: Number(a.date) || null }));
    return json(200, { ok: true, order: { ...orderSummary(task), messages: clientMessages(comments), files } });
  }

  if (method === "POST" && action === "message") {
    if (rateLimited(`pm:${email}`, 30, 3600_000)) return json(429, { ok: false, error: "Too many messages. Please wait a little." });
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || "").trim().slice(0, 4000);
    if (!text) return json(400, { ok: false, error: "Please write a message." });
    const task = await getClientTask(String(body.id || ""), email);
    if (!task) return json(404, { ok: false, error: "Order not found." });
    await commentOnTask(task.id, `💬 Client message:\n${text}`);
    await addTag(task.id, "client-replied");
    await slackNote(`💬 *Message from ${email}* on *${task.name}*\n>${text.slice(0, 1500).replace(/\n/g, "\n>")}`, task.id);
    return json(200, { ok: true });
  }

  if (method === "POST" && action === "upload") {
    if (rateLimited(`pu:${email}`, 30, 3600_000)) return json(429, { ok: false, error: "Too many uploads. Please wait a little." });
    const task = await getClientTask(url.searchParams.get("id") || "", email);
    if (!task) return json(404, { ok: false, error: "Order not found." });
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string") return json(400, { ok: false, error: "Please choose a file." });
    const name = (file as File).name.replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "upload";
    if (file.size > MAX_FILE) return json(400, { ok: false, error: "Files must be 4 MB or smaller. For bigger files, share a link in a message." });
    if (!ALLOWED.test(name)) return json(400, { ok: false, error: "This file type isn't supported. Use PDF, images, Office files, ZIP or text." });
    try {
      await uploadAttachment(task.id, file, name);
    } catch (err) {
      log("portal_upload_failed", { error: String(err) });
      return json(502, { ok: false, error: "The upload failed. Please try again." });
    }
    await commentOnTask(task.id, `📎 Client uploaded: ${name}`);
    await slackNote(`📎 *${email}* uploaded *${name}* to *${task.name}*`, task.id);
    return json(200, { ok: true });
  }

  if (method === "POST" && action === "billing") {
    try {
      const customer = await findCustomerId(email);
      if (!customer) return json(404, { ok: false, error: "No payments found for this email yet. Billing appears here after your first payment." });
      return json(200, { ok: true, url: await billingPortalUrl(customer, ENV.portalUrl) });
    } catch (err) {
      log("portal_billing_failed", { error: String(err) });
      return json(502, { ok: false, error: "Billing is temporarily unavailable. Please contact us." });
    }
  }

  return json(404, { ok: false, error: "unknown_action" });
}

export const GET = (r: Request) => handle(r, "GET");
export const POST = (r: Request) => handle(r, "POST");
