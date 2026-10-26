import { ENV } from "./env.js";
import { layout, textToHtml } from "./email.js";
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

export function paymentReceivedEmail(name: string, ref: string, amountLabel: string) {
  const text = `Hi ${firstName(name)},

Thank you, we've received your payment of ${amountLabel} (reference ${ref}).

Your project is now scheduled. A senior engineer will contact you within ${ENV.responseTime} to kick things off. If you'd like to pick a time now, book here: ${ENV.calendlyUrl}

Best regards,
${ENV.signatureName}`;
  const html = layout({
    heading: "Payment received, thank you!",
    bodyHtml: textToHtml(text.split("\n").slice(2).join("\n").replace(/\n\nBest regards[\s\S]*$/, "")),
    ctaLabel: "Book your kickoff call",
    ctaUrl: ENV.calendlyUrl,
  });
  return { subject: `Payment received (${ref})`, text, html };
}
