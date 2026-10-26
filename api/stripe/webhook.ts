/**
 * POST /api/stripe/webhook: Stripe tells us a payment-link checkout was paid.
 * → ClickUp comment (+ "paid" status), Slack alert, and a "payment received"
 *   email to the client with the kickoff-call link.
 * Subscribe this endpoint to: checkout.session.completed,
 * checkout.session.async_payment_succeeded
 */
import { ENV, has, log } from "../_lib/env.js";
import { formatMoney, getPaymentLinkMetadata, verifyStripeSignature } from "../_lib/stripe.js";
import { commentOnTask, setTaskStatus, taskUrl } from "../_lib/clickup.js";
import { postMessage } from "../_lib/slack.js";
import { sendEmail } from "../_lib/email.js";
import { paymentReceivedEmail } from "../_lib/templates.js";

const seen = new Set<string>();

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"))) {
    return new Response("invalid signature", { status: 400 });
  }
  const event = JSON.parse(raw);
  if (seen.has(event.id)) return new Response("ok");
  seen.add(event.id);

  const relevant = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
  const session = event.data?.object;
  if (!relevant || !session) return new Response("ignored");
  if (event.type === "checkout.session.completed" && session.payment_status === "unpaid") {
    return new Response("pending"); // async method: wait for async_payment_succeeded
  }

  let meta: Record<string, string> = session.metadata || {};
  if (!meta.ref && session.payment_link) meta = await getPaymentLinkMetadata(session.payment_link);

  const ref = meta.ref || session.client_reference_id || session.id;
  const email = session.customer_details?.email || meta.client_email || "";
  const name = session.customer_details?.name || email.split("@")[0] || "there";
  const amount = formatMoney(session.amount_total || 0, session.currency || ENV.currency) + (session.mode === "subscription" ? "/month" : "");
  log("payment_received", { ref, email, amount });

  await commentOnTask(meta.clickup_task_id, `💰 Payment received: ${amount} from ${email} (Stripe session ${session.id}).`);
  await setTaskStatus(meta.clickup_task_id, ENV.clickupStatusPaid);

  if (has.slack()) {
    const url = taskUrl(meta.clickup_task_id);
    await postMessage(
      [
        { type: "section", text: { type: "mrkdwn", text: `💰 *Payment received: ${amount}*\n${name} · ${email}\nRef ${ref}` } },
        ...(url ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url }] }] : []),
      ],
      `Payment received: ${amount} from ${name}`,
    );
  }

  if (email) {
    const mail = paymentReceivedEmail(name, ref, amount);
    await sendEmail(email, mail.subject, mail.html, mail.text);
  }
  return new Response("ok");
}
