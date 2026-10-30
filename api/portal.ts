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
 *   GET  services                → hosting / managed services: Stripe subscription + access details
 *   POST cancel   {subscription} → Stripe page to cancel that subscription
 *   POST ticket   {serviceId?, category, priority, subject, text} → support ticket (ClickUp + Slack + emails)
 *   GET  documents               → every file shared on the client's orders, services and tickets
 * Orders are read live from ClickUp; nothing else is stored.
 */
import { ENV, has, log } from "./_lib/env.js";
import { addTag, clientTag, commentOnTask, createTask, getClientTask, getComments, listClientTasks, taskTitle, taskUrl, uploadAttachment, type CuTask } from "./_lib/clickup.js";
import { billingPortalUrl, cancelSubscriptionUrl, findCustomerId, listSubscriptions, type SubscriptionInfo } from "./_lib/stripe.js";
import { postMessage } from "./_lib/slack.js";
import { sendNotification, sendTeamCopy } from "./_lib/email.js";
import { magicLinkEmail, teamCopyEmail, ticketReceivedEmail } from "./_lib/templates.js";
import {
  clearCookie, clientIp, clientMessages, json, kindOf, orderSummary, platformOf, rateLimited, refOf, sameOrigin, serviceDetails,
  sessionCookie, sessionEmail, signToken, verifyToken,
} from "./_lib/portal.js";

const TICKET_CATEGORIES = ["Technical problem", "Website or server down", "Email", "Domain or DNS", "Billing", "Upgrade or change plan", "New request", "Other"];
const PRIORITIES = ["Normal", "High", "Urgent (site down)"];

function supRef() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `SUP-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X")}`;
}

/** Service status shown to the client, from Stripe when linked, otherwise from ClickUp. */
function serviceStatus(t: CuTask, sub: SubscriptionInfo | undefined, hasDetails: boolean) {
  if (sub) {
    if (sub.status === "canceled") return "Cancelled";
    if (sub.status === "past_due" || sub.status === "unpaid") return "Payment due";
    if (sub.cancelAtPeriodEnd) return "Cancels at period end";
    if (sub.status === "incomplete") return "Awaiting payment";
  }
  if (/cancel/i.test(t.status?.status || "")) return "Cancelled";
  return hasDetails ? "Active" : "Setting up";
}

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
    await sendNotification(email, mail.subject, mail.html, mail.text).catch((err) => log("portal_login_email_failed", { error: String(err) }));
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
    const kind = kindOf(task);
    return json(200, {
      ok: true,
      order: { ...orderSummary(task), messages: clientMessages(comments), files, ...(kind === "service" ? { details: serviceDetails(comments) } : {}) },
    });
  }

  if (method === "GET" && action === "services") {
    try {
      const tasks = (await listClientTasks(email)).filter((t) => kindOf(t) === "service");
      let subs: SubscriptionInfo[] = [];
      try {
        const customer = await findCustomerId(email);
        if (customer) subs = await listSubscriptions(customer);
      } catch (err) {
        log("portal_subscriptions_failed", { error: String(err) });
      }
      const services = await Promise.all(
        tasks.map(async (t) => {
          const comments = await getComments(t.id).catch(() => []);
          const details = serviceDetails(comments);
          const sub = subs.find((x) => x.taskId === t.id) || subs.find((x) => x.ref && x.ref === refOf(t.name));
          return {
            id: t.id,
            title: taskTitle(t.name),
            ref: refOf(t.name),
            platform: platformOf(t),
            status: serviceStatus(t, sub, Boolean(details)),
            billing: sub ? { subscription: sub.id, amount: sub.amount, renews: sub.cancelAtPeriodEnd || sub.status === "canceled" ? null : sub.currentPeriodEnd, endsAt: sub.cancelAtPeriodEnd ? sub.currentPeriodEnd : null, status: sub.status } : null,
            details,
            created: Number(t.date_created) || null,
          };
        }),
      );
      return json(200, { ok: true, services });
    } catch (err) {
      log("portal_services_failed", { error: String(err) });
      return json(502, { ok: false, error: "We couldn't load your services right now. Please try again shortly." });
    }
  }

  if (method === "POST" && action === "cancel") {
    const body = await request.json().catch(() => ({}));
    const subId = String(body.subscription || "");
    if (!/^sub_[A-Za-z0-9]+$/.test(subId)) return json(400, { ok: false, error: "Unknown subscription." });
    try {
      const customer = await findCustomerId(email);
      if (!customer) return json(404, { ok: false, error: "No billing account found for this email." });
      const subs = await listSubscriptions(customer);
      if (!subs.some((x) => x.id === subId)) return json(404, { ok: false, error: "Subscription not found." });
      return json(200, { ok: true, url: await cancelSubscriptionUrl(customer, subId, `${ENV.portalUrl}/portal?tab=services`) });
    } catch (err) {
      log("portal_cancel_failed", { error: String(err) });
      return json(502, { ok: false, error: "Billing is temporarily unavailable. Please contact us." });
    }
  }

  if (method === "POST" && action === "ticket") {
    if (rateLimited(`pt:${email}`, 10, 3600_000)) return json(429, { ok: false, error: "Too many requests. Please wait a little or email us." });
    const body = await request.json().catch(() => ({}));
    const subject = String(body.subject || "").trim().slice(0, 120);
    const text = String(body.text || "").trim().slice(0, 4000);
    const category = TICKET_CATEGORIES.includes(body.category) ? String(body.category) : "Other";
    const priority = PRIORITIES.includes(body.priority) ? String(body.priority) : "Normal";
    if (!subject || !text) return json(400, { ok: false, error: "Please add a subject and describe the issue." });
    let service: CuTask | null = null;
    if (body.serviceId) {
      service = await getClientTask(String(body.serviceId), email);
      if (!service) return json(404, { ok: false, error: "Service not found." });
    }
    const ref = supRef();
    const serviceTitle = service ? taskTitle(service.name) : undefined;
    const urgent = priority.startsWith("Urgent");
    const task = await createTask({
      name: `Support: ${subject} — ${email} (${ref})`,
      markdown: [
        `**Ref:** ${ref}`,
        `**Email:** ${email}`,
        `**Category:** ${category}`,
        `**Priority:** ${priority}`,
        service ? `**Service:** ${serviceTitle} (${refOf(service.name)})` : "",
        service ? `**Service ID:** ${service.id}` : "",
        "",
        "### Request",
        text,
      ].filter((l) => l !== "").join("\n"),
      tags: ["support", clientTag(email), ...(urgent ? ["urgent"] : [])],
      priority: urgent ? 1 : priority === "High" ? 2 : 3,
    }).catch((err) => {
      log("portal_ticket_failed", { error: String(err) });
      return null;
    });
    if (!task) return json(502, { ok: false, error: "We couldn't create your request. Please email us instead." });
    if (service) await commentOnTask(service.id, `🎫 Support request ${ref} opened: ${subject} (${taskUrl(task.id)})`);

    await slackNote(
      `${urgent ? "🔴 *URGENT support request*" : priority === "High" ? "🟠 *Support request (high)*" : "🎫 *Support request*"} ${ref}\n*${subject}*\n${email}${serviceTitle ? ` · ${serviceTitle}` : ""} · ${category}\n>${text.slice(0, 1200).replace(/\n/g, "\n>")}`,
      task.id,
    );
    const mail = ticketReceivedEmail(ref, subject, priority);
    await sendNotification(email, mail.subject, mail.html, mail.text).catch(() => {});
    const copy = teamCopyEmail({
      kind: "lead",
      ref,
      title: `${urgent ? "🔴 URGENT " : ""}Support: ${subject}`,
      clientName: email,
      clientEmail: email,
      rows: [["Email", email], ["Category", category], ["Priority", priority], ["Service", serviceTitle]],
      message: text,
      taskId: task.id,
      status: "New support request from the client portal. Reply in ClickUp with a comment starting \"To client:\" (they get it by email and in the portal), or reply to this email.",
    });
    await sendTeamCopy(copy.subject.replace("New request", "Support request"), copy.html, copy.text, email).catch(() => {});
    log("portal_ticket_created", { ref, email, priority });
    return json(200, { ok: true, id: task.id, ref });
  }

  if (method === "GET" && action === "documents") {
    try {
      const tasks = (await listClientTasks(email)).filter((t) => (t.attachments || []).length);
      const groups = await Promise.all(
        tasks.map(async (t) => {
          const comments = await getComments(t.id).catch(() => []);
          const mine = new Set(comments.map((c) => (c.comment_text || "").match(/^📎 Client uploaded:\s*(.+)$/)?.[1]?.trim()).filter(Boolean) as string[]);
          return (t.attachments || []).map((a) => ({
            id: a.id,
            name: a.title || "File",
            url: a.url,
            size: a.size,
            date: Number(a.date) || null,
            from: mine.has((a.title || "").trim()) ? "you" : "team",
            taskId: t.id,
            taskTitle: taskTitle(t.name).replace(/^Support:\s*/i, ""),
            kind: kindOf(t),
          }));
        }),
      );
      const documents = groups.flat().sort((a, b) => (b.date || 0) - (a.date || 0));
      return json(200, { ok: true, documents });
    } catch (err) {
      log("portal_documents_failed", { error: String(err) });
      return json(502, { ok: false, error: "We couldn't load your documents right now." });
    }
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
