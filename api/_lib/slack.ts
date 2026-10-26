import crypto from "node:crypto";
import { ENV, has, log } from "./env.js";
import type { Lead, LeadRef } from "./types.js";

async function slack(method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.slackBotToken}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) log("slack_error", { method, error: json.error, details: json.response_metadata });
  return json;
}

export const postMessage = (blocks: unknown[], text: string, channel = ENV.slackChannelId) =>
  has.slack() ? slack("chat.postMessage", { channel, blocks, text, unfurl_links: false }) : Promise.resolve(null);
export const updateMessage = (channel: string, ts: string, blocks: unknown[], text: string) =>
  slack("chat.update", { channel, ts, blocks, text });
export const openView = (trigger_id: string, view: unknown) => slack("views.open", { trigger_id, view });
export const postThread = (channel: string, thread_ts: string, text: string) => slack("chat.postMessage", { channel, thread_ts, text });

/** Verifies Slack's request signature (v0) against the raw body. */
export function verifySlack(rawBody: string, timestamp: string | null, signature: string | null) {
  if (!ENV.slackSigningSecret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = "v0=" + crypto.createHmac("sha256", ENV.slackSigningSecret).update(`v0:${timestamp}:${rawBody}`).digest("hex");
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

const field = (label: string, value?: string) => (value ? { type: "mrkdwn", text: `*${label}*\n${value.slice(0, 1900)}` } : null);
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function leadFields(lead: Lead) {
  return [
    field("Client", `${lead.name}${lead.company ? ` · ${lead.company}` : ""}\n${lead.email}${lead.phone ? ` · ${lead.phone}` : ""}`),
    field("Services", lead.services.join(", ") || "Not specified"),
    field("Package", lead.packageName),
    field("Timeline", lead.timeline),
    field("Country", lead.country),
    field("Source", lead.source),
  ].filter(Boolean);
}

/** Lead with an AI draft and approve/edit buttons. */
export function draftBlocks(lead: Lead, draft: string, ref: LeadRef, taskUrl?: string, ai = true) {
  const value = JSON.stringify(ref);
  return [
    { type: "header", text: { type: "plain_text", text: `🆕 New request: ${trunc(lead.name, 60)} (${lead.ref})` } },
    { type: "section", fields: leadFields(lead) },
    { type: "section", text: { type: "mrkdwn", text: `*Message*\n>${trunc(lead.message, 2500).replace(/\n/g, "\n>")}` } },
    { type: "context", elements: [{ type: "mrkdwn", text: "✅ Instant confirmation email already sent to the client." }] },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `*${ai ? "✍️ AI-drafted reply" : "✍️ Suggested reply"}* (review before sending)` } },
    { type: "section", block_id: "draft", text: { type: "mrkdwn", text: trunc(draft, 2900) } },
    {
      type: "actions",
      block_id: "lead_actions",
      elements: [
        { type: "button", style: "primary", text: { type: "plain_text", text: "Send reply" }, action_id: "send_draft", value,
          confirm: { title: { type: "plain_text", text: "Send this reply?" }, text: { type: "mrkdwn", text: `The draft will be emailed to ${ref.e}.` }, confirm: { type: "plain_text", text: "Send" }, deny: { type: "plain_text", text: "Cancel" } } },
        { type: "button", text: { type: "plain_text", text: "Edit, add price & send" }, action_id: "edit_draft", value },
        ...(taskUrl ? [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url: taskUrl }] : []),
      ],
    },
  ];
}

/** Lead that was auto-handled (fixed-price package with a payment link). */
export function autoBlocks(lead: Lead, paymentUrl: string, priceLabel: string, taskUrl?: string) {
  return [
    { type: "header", text: { type: "plain_text", text: `🆕 New request: ${trunc(lead.name, 60)} (${lead.ref})` } },
    { type: "section", fields: leadFields(lead) },
    { type: "section", text: { type: "mrkdwn", text: `*Message*\n>${trunc(lead.message, 2500).replace(/\n/g, "\n>")}` } },
    { type: "context", elements: [{ type: "mrkdwn", text: `⚡ Fixed-price package: confirmation + Stripe payment link (*${priceLabel}*) sent automatically. <${paymentUrl}|Payment link>` }] },
    ...(taskUrl ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url: taskUrl }] }] : []),
  ];
}

/** Replaces the action buttons once the reply is sent. */
export function markSent(blocks: Array<Record<string, unknown>>, by: string, extra?: string) {
  return blocks
    .filter((b) => b.block_id !== "lead_actions")
    .concat([{ type: "context", elements: [{ type: "mrkdwn", text: `✅ Reply sent by <@${by}> · ${new Date().toUTCString()}${extra ? ` · ${extra}` : ""}` }] }]);
}

/** Modal for editing the draft and optionally attaching a Stripe payment link. */
export function editModal(draft: string, meta: string) {
  return {
    type: "modal",
    callback_id: "send_edited",
    private_metadata: meta,
    title: { type: "plain_text", text: "Review & send reply" },
    submit: { type: "plain_text", text: "Send to client" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      { type: "input", block_id: "body", label: { type: "plain_text", text: "Email to the client" },
        element: { type: "plain_text_input", action_id: "v", multiline: true, initial_value: draft.slice(0, 2900) } },
      { type: "input", block_id: "amount", optional: true, label: { type: "plain_text", text: "Add a Stripe payment link (USD amount, optional)" },
        hint: { type: "plain_text", text: "e.g. 2000 for a $2,000 deposit or project fee. Leave empty to send without a payment link." },
        element: { type: "number_input", action_id: "v", is_decimal_allowed: true, min_value: "1" } },
      { type: "input", block_id: "mode", optional: true, label: { type: "plain_text", text: "Payment type" },
        element: { type: "static_select", action_id: "v", initial_option: { text: { type: "plain_text", text: "One-time payment" }, value: "payment" },
          options: [
            { text: { type: "plain_text", text: "One-time payment" }, value: "payment" },
            { text: { type: "plain_text", text: "Monthly subscription" }, value: "subscription" },
          ] } },
      { type: "input", block_id: "label", optional: true, label: { type: "plain_text", text: "What the payment is for (shown at checkout)" },
        element: { type: "plain_text_input", action_id: "v", placeholder: { type: "plain_text", text: "e.g. Website project – 50% deposit" } } },
    ],
  };
}
