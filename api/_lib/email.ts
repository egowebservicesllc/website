import { ENV, has, log } from "./env.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text → simple HTML paragraphs, with URLs turned into links. */
function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${esc(p).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#005fc2">$1</a>')}</p>`)
    .join("");
}

/** Branded email shell in the site's colours. */
export function layout(opts: { heading: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string; footnote?: string }) {
  const cta = opts.ctaUrl
    ? `<p style="margin:28px 0 8px"><a href="${opts.ctaUrl}" style="display:inline-block;background:#005fc2;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px">${esc(opts.ctaLabel || "Continue")}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden">
<tr><td style="background:#005fc2;padding:22px 32px;color:#fff;font-size:20px;font-weight:800">EGO Web Services</td></tr>
<tr><td style="padding:32px;font-size:16px;line-height:1.6">
<h1 style="font-size:22px;margin:0 0 16px">${esc(opts.heading)}</h1>
${opts.bodyHtml}
${cta}
${opts.footnote ? `<p style="margin:24px 0 0;font-size:13px;color:#64748b">${esc(opts.footnote)}</p>` : ""}
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">EGO Web Services LLC · <a href="${ENV.siteUrl}" style="color:#64748b">egowebservices.com</a> · Reply to this email to reach our team.</td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string, text: string, bcc?: string) {
  if (!has.email()) {
    log("email_skipped_no_provider", { to, subject });
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: ENV.emailFrom, to: [to], reply_to: ENV.emailReplyTo, subject, html, text, ...(bcc ? { bcc: [bcc] } : {}) }),
  });
  if (!res.ok) {
    log("email_failed", { to, status: res.status, body: (await res.text()).slice(0, 300) });
    return false;
  }
  log("email_sent", { to, subject });
  return true;
}

export { textToHtml };
