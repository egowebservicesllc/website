/**
 * POST /api/slack/actions: Slack interactivity endpoint (buttons + modal).
 *  - "Send reply"              → emails the drafted reply to the client
 *  - "Edit, add price & send"  → opens a modal; on submit emails the edited
 *                                reply, optionally with a new Stripe payment link
 * Every send also comments on the ClickUp task and updates the Slack message.
 */
import { waitUntil } from "@vercel/functions";
import { ENV, log } from "../_lib/env.js";
import { editModal, markSent, openView, postThread, updateMessage, verifySlack } from "../_lib/slack.js";
import { sendEmail } from "../_lib/email.js";
import { replyEmail } from "../_lib/templates.js";
import { commentOnTask, setTaskStatus } from "../_lib/clickup.js";
import { createPaymentLink, formatMoney } from "../_lib/stripe.js";
import type { LeadRef } from "../_lib/types.js";

const unescapeSlack = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const ok = () => new Response("", { status: 200 });

interface Block { block_id?: string; text?: { text?: string } }

async function sendReply(opts: {
  ref: LeadRef;
  body: string;
  by: string;
  channel: string;
  ts: string;
  blocks?: Block[];
  payment?: { amountCents: number; mode: "payment" | "subscription"; label: string };
}) {
  const { ref, body, by, channel, ts } = opts;
  let payment: { url: string; label: string } | undefined;
  if (opts.payment) {
    try {
      const url = await createPaymentLink({
        ref: ref.r,
        email: ref.e,
        productName: opts.payment.label,
        amountCents: opts.payment.amountCents,
        mode: opts.payment.mode,
        interval: "month",
        clickupTaskId: ref.t,
      });
      if (url) payment = { url, label: `${formatMoney(opts.payment.amountCents)}${opts.payment.mode === "subscription" ? "/month" : ""}` };
    } catch (err) {
      log("stripe_failed", { ref: ref.r, error: String(err) });
      await postThread(channel, ts, `⚠️ Couldn't create the Stripe payment link: ${String(err).slice(0, 200)}. The reply was not sent; please try again.`);
      return;
    }
  }

  const mail = replyEmail(ref.n, ref.r, body, payment);
  const sent = await sendEmail(ref.e, mail.subject, mail.html, mail.text);
  if (!sent) {
    await postThread(channel, ts, `⚠️ The email to ${ref.e} could not be sent. Check the RESEND_API_KEY / sender domain.`);
    return;
  }

  await commentOnTask(ref.t, `✉️ Reply emailed to ${ref.e} by Slack user ${by}${payment ? ` with a Stripe payment link (${payment.label}): ${payment.url}` : ""}.\n\n${body}`);
  await setTaskStatus(ref.t, ENV.clickupStatusReplied);

  const extra = payment ? `💳 payment link ${payment.label}` : undefined;
  const blocks = opts.blocks ?? (await fetchMessageBlocks(channel, ts));
  if (blocks) await updateMessage(channel, ts, markSent(blocks as Array<Record<string, unknown>>, by, extra), "Reply sent");
  else await postThread(channel, ts, `✅ Reply sent by <@${by}>${extra ? ` · ${extra}` : ""}`);
}

async function fetchMessageBlocks(channel: string, ts: string): Promise<Block[] | undefined> {
  const res = await fetch(`https://slack.com/api/conversations.history?channel=${channel}&latest=${ts}&inclusive=true&limit=1`, {
    headers: { Authorization: `Bearer ${ENV.slackBotToken}` },
  }).then((r) => r.json());
  return res?.messages?.[0]?.blocks;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySlack(raw, request.headers.get("x-slack-request-timestamp"), request.headers.get("x-slack-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }
  const payload = JSON.parse(new URLSearchParams(raw).get("payload") || "{}");
  const user = payload.user?.id || "unknown";

  if (payload.type === "block_actions") {
    const action = payload.actions?.[0];
    if (!action || action.action_id === "open_clickup") return ok();
    const ref: LeadRef = JSON.parse(action.value || "{}");
    const channel = payload.channel?.id || payload.container?.channel_id;
    const ts = payload.message?.ts || payload.container?.message_ts;
    const blocks: Block[] = payload.message?.blocks || [];
    const draft = unescapeSlack(blocks.find((b) => b.block_id === "draft")?.text?.text || "");

    if (action.action_id === "send_draft") {
      waitUntil(sendReply({ ref, body: draft, by: user, channel, ts, blocks }));
      return ok();
    }
    if (action.action_id === "edit_draft") {
      await openView(payload.trigger_id, editModal(draft, JSON.stringify({ ...ref, c: channel, ts })));
      return ok();
    }
    return ok();
  }

  if (payload.type === "view_submission" && payload.view?.callback_id === "send_edited") {
    const v = payload.view.state.values;
    const meta = JSON.parse(payload.view.private_metadata || "{}");
    const body: string = v.body?.v?.value || "";
    const amountRaw = v.amount?.v?.value;
    const amount = amountRaw ? Number(amountRaw) : 0;
    if (amountRaw && (!isFinite(amount) || amount < 1 || amount > 100000)) {
      return Response.json({ response_action: "errors", errors: { amount: "Enter an amount between 1 and 100,000 USD." } });
    }
    const mode = (v.mode?.v?.selected_option?.value || "payment") as "payment" | "subscription";
    const label = v.label?.v?.value || `EGO Web Services: ${meta.s || "project"} (${meta.r})`;
    const { c: channel, ts, ...ref } = meta;
    waitUntil(
      sendReply({
        ref: ref as LeadRef,
        body,
        by: user,
        channel,
        ts,
        payment: amount ? { amountCents: Math.round(amount * 100), mode, label } : undefined,
      }),
    );
    return Response.json({ response_action: "clear" });
  }

  return ok();
}
