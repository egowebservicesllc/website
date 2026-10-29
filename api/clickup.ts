/**
 * /api/clickup
 *   GET  ?action=setup&key=<PORTAL_SECRET> → creates the ClickUp webhook (run once)
 *        and shows the secret to save as CLICKUP_WEBHOOK_SECRET in Vercel.
 *   POST (from ClickUp)                    → taskCommentPosted / taskStatusUpdated:
 *        a comment starting "To client:" is emailed to the client; moving an
 *        order to In progress / In review / Delivered emails a status update.
 */
import crypto from "node:crypto";
import { ENV, has, log } from "./_lib/env.js";
import { createWebhook, emailFromTask, getComments, getTask, taskTitle } from "./_lib/clickup.js";
import { sendEmail } from "./_lib/email.js";
import { statusUpdateEmail, teamMessageEmail } from "./_lib/templates.js";
import { STAGES, refOf, stageOf } from "./_lib/portal.js";

const done = new Set<string>(); // de-duplicates ClickUp retries on a warm instance

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "setup") return new Response("ok");
  const key = url.searchParams.get("key") || "";
  if (!ENV.portalSecret || key.length !== ENV.portalSecret.length || !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(ENV.portalSecret))) {
    return new Response("Not allowed. Add ?key= followed by your PORTAL_SECRET.", { status: 403 });
  }
  if (!has.clickup()) return new Response("ClickUp isn't configured (CLICKUP_API_TOKEN / CLICKUP_LIST_ID).", { status: 400 });
  try {
    const hook = await createWebhook(`${ENV.siteUrl}/api/clickup`);
    const secret = hook.webhook?.secret || hook.secret || "";
    return new Response(
      `ClickUp webhook created.\n\nIn Vercel → Settings → Environment Variables, add:\n\nCLICKUP_WEBHOOK_SECRET = ${secret}\n\nthen Redeploy. (This page shows the secret only once; you can run setup again to make a new one.)`,
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return new Response(`Setup failed: ${String(err).slice(0, 300)}`, { status: 502 });
  }
}

function validSignature(raw: string, sig: string | null) {
  if (!ENV.clickupWebhookSecret || !sig) return false;
  const expected = crypto.createHmac("sha256", ENV.clickupWebhookSecret).update(raw).digest("hex");
  return expected.length === sig.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-signature"))) return new Response("invalid signature", { status: 401 });
  const evt = JSON.parse(raw || "{}");
  const taskId: string | undefined = evt.task_id;
  const item = evt.history_items?.[0] || {};
  if (!taskId || !has.email()) return new Response("ignored");
  const key = `${evt.event}:${item.id || ""}`;
  if (done.has(key)) return new Response("dup");
  done.add(key);

  try {
    const task = await getTask(taskId);
    const to = emailFromTask(task);
    if (!to) return new Response("no client email");
    const title = taskTitle(task.name);
    const ref = refOf(task.name);

    if (evt.event === "taskCommentPosted") {
      // Re-read the comment from ClickUp rather than trusting the payload.
      const comments = await getComments(taskId);
      const c = comments.find((x) => x.id === String(item.comment?.id || item.id)) || comments[0];
      const text = (c?.comment_text || "").trim();
      if (!/^to client:/i.test(text)) return new Response("internal comment");
      const message = text.replace(/^to client:\s*/i, "");
      const mail = teamMessageEmail(title, ref, message);
      await sendEmail(to, mail.subject, mail.html, mail.text);
      log("client_notified_message", { taskId, ref });
    }

    if (evt.event === "taskStatusUpdated") {
      const prev = item.before?.status ?? item.before;
      const before = stageOf(typeof prev === "string" ? prev : prev?.status);
      const after = stageOf(task.status?.status);
      if (after > 0 && after !== before) {
        const mail = statusUpdateEmail(title, ref, STAGES[after]);
        await sendEmail(to, mail.subject, mail.html, mail.text);
        log("client_notified_status", { taskId, ref, stage: STAGES[after] });
      }
    }
  } catch (err) {
    log("clickup_webhook_failed", { taskId, error: String(err) });
  }
  return new Response("ok");
}
