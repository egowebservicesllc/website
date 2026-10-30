import { ENV } from "./env.js";
import { layout, textToHtml } from "./email.js";
import { taskUrl } from "./clickup.js";
import type { Lead } from "./types.js";

const firstName = (n: string) => n.split(/\s+/)[0] || "there";

/** Instant confirmation sent the moment the form is submitted. */
export function confirmationEmail(lead: Lead, opts: { paymentUrl?: string; priceLabel?: string; packageLabel?: string }) {
  const summary = [
    lead.services.length ? `Services: ${lead.services.join(", ")}` : "",
    opts.packageLabel ? `Package: ${opts.packageLabel}${opts.priceLabel ? ` (${opts.priceLabel})` : ""}` : "",
    lead.timeline ? `Timeline: ${lead.timeline}` : "",
    `Reference: ${lead.ref}`,
  ].filter(Boolean);

  const paySection = opts.paymentUrl
    ? `Ready to get started? ${opts.packageLabel} is a fixed-price package, so you can secure your spot right away with our secure Stripe checkout:\n${opts.paymentUrl}\n\nPrefer to talk first? No problem. A senior engineer will still reply within ${ENV.responseTime}, and you can book a free 30-minute call any time: ${ENV.calendlyUrl}`
    : `What happens next:\n1. A senior engineer reviews your request.\n2. You get a reply within ${ENV.responseTime}, with any questions we need for a fixed quote.\n3. You receive a clear proposal with scope, timeline and fixed pricing.\n\nWant to move faster? Book a free 30-minute call: ${ENV.calendlyUrl}`;

  const text = `Hi ${firstName(lead.name)},

Thanks for contacting EGO Web Services. We've received your request.

${summary.join("\n")}

${paySection}

Best regards,
${ENV.signatureName}`;

  const html = layout({
    heading: `Thanks, ${firstName(lead.name)}. Your request is in.`,
    bodyHtml:
      `<p style="margin:0 0 16px">We've received your request and our team is on it.</p>` +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5f9;border-radius:12px;margin:0 0 20px"><tr><td style="padding:16px 20px;font-size:14px;line-height:1.7">${summary.map((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("<br>")}</td></tr></table>` +
      textToHtml(
        opts.paymentUrl
          ? `Ready to get started? ${opts.packageLabel} is a fixed-price package, so you can secure your spot right away with the button below (secure Stripe checkout).\n\nPrefer to talk first? No problem. A senior engineer will still reply within ${ENV.responseTime}, and you can book a free 30-minute call any time: ${ENV.calendlyUrl}`
          : paySection,
      ),
    ctaLabel: opts.paymentUrl ? `Pay securely: ${opts.priceLabel}` : "Book a free 30-minute call",
    ctaUrl: opts.paymentUrl || ENV.calendlyUrl,
    footnote: opts.paymentUrl ? "Payments are processed securely by Stripe. You'll receive a receipt by email." : undefined,
  });

  return { subject: `We've received your request (${lead.ref})`, text, html };
}

/** The reviewed reply sent from Slack (AI draft or edited). */
export function replyEmail(clientName: string, ref: string, body: string, payment?: { url: string; label: string }) {
  const text = payment ? `${body}\n\nTo get started, you can pay securely here (${payment.label}):\n${payment.url}` : body;
  const html = layout({
    heading: `Re: your request (${ref})`,
    bodyHtml: textToHtml(body),
    ctaLabel: payment ? `Pay securely: ${payment.label}` : "Book a free 30-minute call",
    ctaUrl: payment ? payment.url : ENV.calendlyUrl,
    footnote: payment ? "Payments are processed securely by Stripe. You'll receive a receipt by email." : undefined,
  });
  return { subject: `Re: your request to EGO Web Services (${ref})`, text, html };
}

export function paymentReceivedEmail(name: string, ref: string, amountLabel: string, orderTitle?: string, aiBody?: string) {
  const what = orderTitle ? ` for ${orderTitle}` : "";
  if (aiBody) {
    const text = `${aiBody}\n\nFollow your order, message our team and upload files in your client portal: ${ENV.portalUrl}\n\nReference: ${ref}`;
    const html = layout({
      heading: "Payment received, thank you!",
      bodyHtml: textToHtml(aiBody),
      ctaLabel: "Open your client portal",
      ctaUrl: ENV.portalUrl,
      footnote: `Reference ${ref} · ${amountLabel}. Sign in to the portal with this email address.`,
    });
    return { subject: `Payment received: ${orderTitle || "your order"} (${ref})`, text, html };
  }
  const text = `Hi ${firstName(name)},

Thank you, we've received your payment of ${amountLabel}${what} (reference ${ref}).

Your project is now scheduled. A senior engineer will contact you within ${ENV.responseTime} to kick things off. If you'd like to pick a time now, book here: ${ENV.calendlyUrl}

You can follow your order, message our team and upload files in your client portal: ${ENV.portalUrl}

Best regards,
${ENV.signatureName}`;
  const html = layout({
    heading: "Payment received, thank you!",
    bodyHtml: textToHtml(
      `Thank you, we've received your payment of ${amountLabel}${what} (reference ${ref}).\n\nYour project is now scheduled. A senior engineer will contact you within ${ENV.responseTime} to kick things off. Want to pick a time now? Book your kickoff call: ${ENV.calendlyUrl}`,
    ),
    ctaLabel: "Open your client portal",
    ctaUrl: ENV.portalUrl,
    footnote: "In the portal you can follow your order, message our team and upload files. Sign in with this email address.",
  });
  return { subject: `Payment received (${ref})`, text, html };
}

/** Magic sign-in link for the client portal. */
export function magicLinkEmail(link: string) {
  const text = `Here's your sign-in link for the EGO Web Services client portal:\n${link}\n\nThe link works for 20 minutes. If you didn't ask for it, you can ignore this email.\n\n${ENV.signatureName}`;
  const html = layout({
    heading: "Sign in to your client portal",
    bodyHtml: textToHtml("Click the button below to sign in. The link works for 20 minutes and can only be used from this email."),
    ctaLabel: "Sign in to the portal",
    ctaUrl: link,
    footnote: "If you didn't ask to sign in, you can safely ignore this email.",
  });
  return { subject: "Your EGO Web Services sign-in link", text, html };
}

/** The team replied to the client from ClickUp ("To client: ..."). */
export function teamMessageEmail(orderTitle: string, ref: string, message: string) {
  const text = `New message about ${orderTitle}${ref ? ` (${ref})` : ""}:\n\n${message}\n\nReply or follow your order in the client portal: ${ENV.portalUrl}\n\n${ENV.signatureName}`;
  const html = layout({
    heading: `New message about ${orderTitle}`,
    bodyHtml: `<div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin:0 0 8px">${textToHtml(message)}</div>`,
    ctaLabel: "Reply in the portal",
    ctaUrl: ENV.portalUrl,
    footnote: ref ? `Order reference ${ref}` : undefined,
  });
  return { subject: `New message about ${orderTitle}${ref ? ` (${ref})` : ""}`, text, html };
}

/** Order moved to a new stage. */
export function statusUpdateEmail(orderTitle: string, ref: string, stageLabel: string) {
  const line = stageLabel === "Delivered"
    ? `Good news: ${orderTitle} has been delivered.`
    : `Your order ${orderTitle} is now: ${stageLabel}.`;
  const text = `${line}\n\nSee the details, files and messages in your client portal: ${ENV.portalUrl}\n\n${ENV.signatureName}`;
  const html = layout({
    heading: stageLabel === "Delivered" ? "Your order has been delivered" : `Order update: ${stageLabel}`,
    bodyHtml: textToHtml(line),
    ctaLabel: "View your order",
    ctaUrl: ENV.portalUrl,
    footnote: ref ? `Order reference ${ref}` : undefined,
  });
  return { subject: `${stageLabel}: ${orderTitle}${ref ? ` (${ref})` : ""}`, text, html };
}

/** Fixed-price package request received (AI-written body + secure payment button). */
export function fixedOrderEmail(ref: string, body: string, opts: { packageLabel: string; priceLabel: string; paymentUrl?: string }) {
  const text = opts.paymentUrl ? `${body}\n\nPay securely (${opts.priceLabel}): ${opts.paymentUrl}\n\nReference: ${ref}` : `${body}\n\nReference: ${ref}`;
  const html = layout({
    heading: `Your ${opts.packageLabel} request is in`,
    bodyHtml:
      textToHtml(body) +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5f9;border-radius:12px;margin:8px 0 0"><tr><td style="padding:14px 20px;font-size:14px;line-height:1.7">Package: ${esc(opts.packageLabel)} (${esc(opts.priceLabel)})<br>Reference: ${esc(ref)}</td></tr></table>`,
    ctaLabel: opts.paymentUrl ? `Pay securely: ${opts.priceLabel}` : undefined,
    ctaUrl: opts.paymentUrl,
    footnote: opts.paymentUrl ? "Payments are processed securely by Stripe. You'll receive a receipt by email." : undefined,
  });
  return { subject: `We've received your ${opts.packageLabel} request (${ref})`, text, html };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Copy of a lead/order/payment for the team inbox (info@). Reply-To is the
 * client, so pressing Reply answers them directly.
 */
export function teamCopyEmail(opts: {
  kind: "lead" | "order" | "payment";
  ref: string;
  title: string; // e.g. "Logo Design" or "Web Development"
  clientName: string;
  clientEmail: string;
  rows: [string, string | undefined][];
  message?: string;
  taskId?: string;
  status: string; // what the automation already did
  draft?: { text: string; ai: boolean }; // reply draft for a human to send
}) {
  const icon = opts.kind === "payment" ? "💰" : opts.kind === "order" ? "🛒" : "🆕";
  const label = opts.kind === "payment" ? "Payment received" : opts.kind === "order" ? "New order" : "New request";
  const subject = `${icon} ${label}: ${opts.title} from ${opts.clientName} (${opts.ref})`;
  const rows = opts.rows.filter(([, v]) => v) as [string, string][];
  const url = taskUrl(opts.taskId);
  const replySubject = `Re: your request to EGO Web Services (${opts.ref})`;
  const mailto = opts.draft
    ? `mailto:${encodeURIComponent(opts.clientEmail)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(opts.draft.text.slice(0, 1800))}`
    : "";

  const text = [
    `${label}: ${opts.title}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    opts.message ? `\nMessage:\n${opts.message}` : "",
    `\nStatus: ${opts.status}`,
    url ? `ClickUp: ${url}` : "",
    opts.draft ? `\n--- ${opts.draft.ai ? "AI-drafted reply" : "Suggested reply"} (review, then send) ---\n${opts.draft.text}\n---\nSend it from Slack (Send reply / Edit, add price & send), or press Reply here: this email's Reply-To is the client.` : "",
  ].filter((l) => l !== "").join("\n");

  const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6;margin:0 0 16px">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  const bodyHtml =
    table +
    (opts.message ? `<p style="margin:0 0 6px;font-weight:700">Message</p><div style="background:#f1f5f9;border-radius:12px;padding:14px 18px;margin:0 0 16px;font-size:14px">${textToHtml(opts.message)}</div>` : "") +
    `<p style="margin:0 0 16px;font-size:14px"><strong>Status:</strong> ${esc(opts.status)}${url ? ` · <a href="${url}" style="color:#005fc2">Open in ClickUp</a>` : ""}</p>` +
    (opts.draft
      ? `<p style="margin:0 0 6px;font-weight:700">${opts.draft.ai ? "✍️ AI-drafted reply" : "✍️ Suggested reply"} (review before sending)</p><div style="border:2px dashed #93c5fd;border-radius:12px;padding:14px 18px;margin:0 0 12px;font-size:14px">${textToHtml(opts.draft.text)}</div><p style="margin:0;font-size:13px;color:#64748b">Send it from Slack (<em>Send reply</em> or <em>Edit, add price &amp; send</em>), or use the button to open it in your mail app. Replying to this email also goes straight to the client.</p>`
      : "");
  const html = layout({
    heading: `${label}: ${opts.title}`,
    bodyHtml,
    ctaLabel: opts.draft ? "Open reply in my mail app" : url ? "Open in ClickUp" : undefined,
    ctaUrl: opts.draft ? mailto : url,
    footnote: `${opts.clientName} · ${opts.clientEmail} · Ref ${opts.ref}`,
  });
  return { subject, text, html };
}

/** Support request received (client portal). */
export function ticketReceivedEmail(ref: string, subject: string, priority: string) {
  const urgent = priority.startsWith("Urgent");
  const line = urgent
    ? "We've received your urgent request and our team has been alerted right away."
    : `We've received your request and will reply within ${ENV.responseTime}.`;
  const text = `${line}\n\nSubject: ${subject}\nReference: ${ref}\nPriority: ${priority}\n\nFollow it and reply in your client portal: ${ENV.portalUrl}/portal?tab=support\n\n${ENV.signatureName}`;
  const html = layout({
    heading: "We've received your support request",
    bodyHtml:
      textToHtml(line) +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5f9;border-radius:12px;margin:0 0 8px"><tr><td style="padding:14px 20px;font-size:14px;line-height:1.7">Subject: ${esc(subject)}<br>Reference: ${esc(ref)}<br>Priority: ${esc(priority)}</td></tr></table>`,
    ctaLabel: "Open your request",
    ctaUrl: `${ENV.portalUrl}/portal?tab=support`,
    footnote: "You'll get an email when we reply. You can add details or files to the request in the portal.",
  });
  return { subject: `Support request received: ${subject} (${ref})`, text, html };
}

/** Access details were added for a hosting / managed service (details stay in the portal). */
export function serviceReadyEmail(title: string, ref: string) {
  const text = `Good news: your ${title} is set up.\n\nYour access details (control panel or server address, username, nameservers) are in your client portal: ${ENV.portalUrl}/portal?tab=services\n\nPasswords are never shown in the portal or sent with this email; we share them separately.\n\n${ENV.signatureName}`;
  const html = layout({
    heading: `Your ${title} is ready`,
    bodyHtml: textToHtml(`Good news: your ${title} is set up and ready to use.\n\nYour access details (control panel or server address, username and nameservers) are waiting in your client portal.\n\nFor your security, passwords are never shown in the portal or included in emails; we share them separately.`),
    ctaLabel: "View access details",
    ctaUrl: `${ENV.portalUrl}/portal?tab=services`,
    footnote: ref ? `Reference ${ref}` : undefined,
  });
  return { subject: `Your ${title} is ready${ref ? ` (${ref})` : ""}`, text, html };
}
