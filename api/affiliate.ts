/**
 * /api/affiliate?action=… : partner (affiliate) dashboard.
 *   POST login    {email}  → emails a sign-in link from affiliates@ (always answers ok)
 *   POST session  {token}  → exchanges the link token for a 30-day session cookie
 *   POST logout
 *   GET  me                → partner name, code and their referrals with commission
 * Partners and referrals are read live from ClickUp (see _lib/affiliate.ts).
 */
import { ENV, has, log } from "./_lib/env.js";
import { clientIp, json, rateLimited, sameOrigin } from "./_lib/portal.js";
import { sendFromAffiliates } from "./_lib/email.js";
import { partnerLoginEmail } from "./_lib/partnerEmails.js";
import {
  clearPartnerCookie, findPartner, partnerLoginToken, partnerReferrals, partnerSessionCookie, partnerSessionEmail, verifyPartnerLogin,
} from "./_lib/affiliate.js";

async function handle(request: Request, method: "GET" | "POST") {
  if (!has.portal()) return json(503, { ok: false, error: "The partner dashboard isn't set up yet." });
  if (!sameOrigin(request)) return json(403, { ok: false, error: "forbidden" });
  const action = new URL(request.url).searchParams.get("action") || "";
  const ip = clientIp(request);

  if (method === "POST" && action === "login") {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { ok: false, error: "Please enter a valid email." });
    if (rateLimited(`al:${ip}`, 10, 3600_000) || rateLimited(`ae:${email}`, 4, 3600_000)) {
      return json(429, { ok: false, error: "Too many sign-in requests. Please wait a few minutes." });
    }
    const partner = await findPartner(email).catch(() => null);
    if (partner) {
      const link = `${ENV.siteUrl}/affiliates/dashboard?token=${encodeURIComponent(partnerLoginToken(email, 20 * 60))}`;
      const mail = partnerLoginEmail(link);
      await sendFromAffiliates(email, mail.subject, mail.html, mail.text).catch((err) => log("partner_login_email_failed", { error: String(err) }));
    }
    log("partner_login_requested", { email, known: Boolean(partner) });
    return json(200, { ok: true }); // same answer whether or not the email is a partner
  }

  if (method === "POST" && action === "session") {
    const body = await request.json().catch(() => ({}));
    const email = verifyPartnerLogin(String(body.token || ""));
    if (!email) return json(401, { ok: false, error: "This sign-in link has expired. Please request a new one." });
    return json(200, { ok: true }, { "Set-Cookie": partnerSessionCookie(email) });
  }

  if (method === "POST" && action === "logout") return json(200, { ok: true }, { "Set-Cookie": clearPartnerCookie() });

  const email = partnerSessionEmail(request);
  if (!email) return json(401, { ok: false, error: "signed_out" });

  if (method === "GET" && action === "me") {
    try {
      const partner = await findPartner(email);
      if (!partner) return json(404, { ok: false, error: "We couldn't find a partner account for this email. Apply on the partner program page first." });
      const { referrals, stats } = await partnerReferrals(partner.code);
      return json(200, { ok: true, email, name: partner.name, code: partner.code, joined: partner.task.date_created ? new Date(Number(partner.task.date_created)).toISOString() : null, referrals, stats });
    } catch (err) {
      log("partner_me_failed", { error: String(err) });
      return json(502, { ok: false, error: "Your dashboard is temporarily unavailable. Please try again shortly." });
    }
  }

  return json(404, { ok: false, error: "unknown_action" });
}

export const GET = (r: Request) => handle(r, "GET");
export const POST = (r: Request) => handle(r, "POST");
