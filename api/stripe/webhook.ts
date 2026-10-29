/**
 * POST /api/stripe/webhook: Stripe tells us a payment-link checkout was paid.
 * → ClickUp comment (+ "paid" status), Slack alert, an AI-written "payment
 *   received + what happens next" email to the client (from notifications@)
 *   and a copy for the team inbox (info@).
 * Subscribe this endpoint to: checkout.session.completed,
 * checkout.session.async_payment_succeeded
 */
import { ENV, has, log } from "../_lib/env.js";
import { formatMoney, getPaymentLinkMetadata, verifyStripeSignature } from "../_lib/stripe.js";
import { addTag, commentOnTask, getTask, removeTag, setTaskStatus, taskTitle, taskUrl } from "../_lib/clickup.js";
import { postMessage } from "../_lib/slack.js";
import { sendNotification, sendTeamCopy } from "../_lib/email.js";
import { paymentReceivedEmail, teamCopyEmail } from "../_lib/templates.js";
import { writeFixedEmail } from "../_lib/ai.js";
import { PACKAGE_SERVICES } from "../../src/lib/packages.js";

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
  await removeTag(meta.clickup_task_id, "awaiting-payment");
  await addTag(meta.clickup_task_id, "paid");
  let orderTitle: string | undefined;
  if (meta.clickup_task_id && has.clickup()) {
    try { orderTitle = taskTitle((await getTask(meta.clickup_task_id)).name); } catch { /* optional */ }
  }

  if (has.slack()) {
    const url = taskUrl(meta.clickup_task_id);
    await postMessage(
      [
        { type: "section", text: { type: "mrkdwn", text: `💰 *Payment received: ${amount}*${orderTitle ? ` for *${orderTitle}*` : ""}\n${name} · ${email}\nRef ${ref}` } },
        ...(url ? [{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open in ClickUp" }, action_id: "open_clickup", url }] }] : []),
      ],
      `Payment received: ${amount} from ${name}`,
    );
  }

  if (email) {
    // Fixed-price package? Write a tailored "what happens next" email with AI.
    const found = orderTitle
      ? PACKAGE_SERVICES.flatMap((sv) => sv.packages.filter((p) => p.checkout && orderTitle!.startsWith(p.name)).map((p) => ({ sv, p })))[0]
      : undefined;
    let aiBody: string | undefined;
    if (found) {
      const body = await writeFixedEmail("payment_received", {
        lead: { ref, name, email, message: "", services: [found.sv.title], serviceId: found.sv.id, packageName: found.p.name, receivedAt: new Date().toISOString() },
        serviceId: found.sv.id,
        serviceTitle: found.sv.title,
        packageName: found.p.name,
        priceLabel: amount,
        paymentReady: false,
      });
      aiBody = body.text;
    }
    const mail = paymentReceivedEmail(name, ref, amount, orderTitle, aiBody);
    await sendNotification(email, mail.subject, mail.html, mail.text);
  }

  const copy = teamCopyEmail({
    kind: "payment",
    ref,
    title: `${orderTitle || "Order"} (${amount})`,
    clientName: name,
    clientEmail: email,
    rows: [["Name", name], ["Email", email], ["Amount", amount], ["Order", orderTitle], ["Stripe session", session.id]],
    taskId: meta.clickup_task_id,
    status: "Paid. The client was emailed what happens next and a link to the client portal. Next: deliver the onboarding details.",
  });
  await sendTeamCopy(copy.subject, copy.html, copy.text, email);
  return new Response("ok");
}
