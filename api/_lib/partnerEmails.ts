/** Partner program emails, sent from affiliates@egowebservices.com. */
import { ENV } from "./env.js";
import { layout } from "./email.js";
import { COMMISSIONS, COOKIE_DAYS, LEVELS, MIN_PAYOUT, money } from "../../src/lib/affiliates.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const PARTNER_PDFS = () => [
  { filename: "EGO-Partner-Program-Commission-Plan.pdf", path: `${ENV.siteUrl}/api/partner-kit?doc=plan` },
  { filename: "EGO-Partner-Quick-Guide.pdf", path: `${ENV.siteUrl}/api/partner-kit?doc=guide` },
];

const p = (html: string) => `<p style="margin:0 0 16px">${html}</p>`;
const h2 = (t: string) => `<h2 style="font-size:17px;margin:28px 0 10px;color:#0f172a">${esc(t)}</h2>`;
const link = (url: string, label = url) => `<a href="${url}" style="color:#005fc2;word-break:break-all">${esc(label)}</a>`;

function rateCell(rate: number, recurring: boolean, months?: number) {
  return `<strong>${rate}%</strong>${recurring ? ` monthly, ${months} mo` : ""}`;
}

export function partnerWelcomeEmail(o: { name: string; code: string; dashboardUrl: string }) {
  const first = o.name.split(/\s+/)[0] || "there";
  const site = ENV.siteUrl;
  const mainLink = `${site}/?ref=${o.code}`;
  const serviceLinks: [string, string][] = [
    ["Google Cloud", "/google-cloud"],
    ["Managed hosting", "/hosting"],
    ["Web development", "/web-development"],
    ["Mobile apps", "/mobile-app-development"],
    ["Branding & design", "/branding-design"],
    ["Digital marketing", "/digital-marketing"],
    ["Free cloud cost review", "/free-cloud-cost-review"],
  ];

  const rows = COMMISSIONS.map(
    (c) => `<tr>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0">${esc(c.label)}</td>
${LEVELS.map((l) => `<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;white-space:nowrap">${rateCell(c.rate + l.bonus, c.type === "recurring", c.months)}</td>`).join("")}
</tr>`,
  ).join("");

  const bodyHtml = [
    p(`Hi ${esc(first)},`),
    p(`Welcome to the EGO Partner Program. Your account is active, so you can start sharing your link and earning commission today.`),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;margin:8px 0 8px"><tr><td style="padding:18px 20px">
<p style="margin:0 0 6px;font-size:13px;color:#1e40af;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Your referral code</p>
<p style="margin:0 0 12px;font-size:24px;font-weight:800;font-family:Menlo,Consolas,monospace;color:#0f172a">${esc(o.code)}</p>
<p style="margin:0;font-size:14px">Your main link: ${link(mainLink)}</p>
</td></tr></table>`,
    p(`Use the button below to open your partner dashboard. It shows every client you refer, their status and your commission. The button signs you in straight away. Later you can sign in any time at ${link(`${site}/affiliates/dashboard`, "egowebservices.com/affiliates/dashboard")} with this email address.`),
    `<p style="margin:8px 0 8px"><a href="${o.dashboardUrl}" style="display:inline-block;background:#005fc2;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px">Open my partner dashboard</a></p>`,

    h2("What you earn"),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;overflow:hidden">
<tr style="background:#f8fafc;text-align:left"><th style="padding:9px 10px;border-bottom:1px solid #e2e8f0">Service</th>${LEVELS.map((l) => `<th style="padding:9px 10px;border-bottom:1px solid #e2e8f0">${esc(l.name)}${l.minClients ? `<br><span style="font-weight:400;color:#64748b;font-size:12px">${l.minClients}+ clients/yr</span>` : `<br><span style="font-weight:400;color:#64748b;font-size:12px">You start here</span>`}</th>`).join("")}</tr>
${rows}
</table>`,
    p(`<span style="font-size:13px;color:#64748b">Project services pay a % of the client's project. Hosting and marketing pay a % of every monthly payment for the months shown. Commission is approved once the client has paid and the refund window has passed, and paid monthly once you reach ${money(MIN_PAYOUT)}.</span>`),

    h2("Your partner toolkit"),
    p(`<strong>1. Links for every service.</strong> Add <code>?ref=${esc(o.code)}</code> to any page on our site, or copy ready-made links from your dashboard:`),
    `<ul style="margin:0 0 16px;padding-left:20px;font-size:14px">${serviceLinks.map(([l, path]) => `<li style="margin:0 0 4px">${esc(l)}: ${link(`${site}${path}?ref=${o.code}`)}</li>`).join("")}</ul>`,
    p(`<strong>2. Banners</strong> for your website, LinkedIn, Facebook and Instagram, with copy-and-paste code that already includes your link. Find them in the Resources tab of your dashboard.`),
    p(`<strong>3. Videos.</strong> Our promo videos are ready to share. Post them with your link in the caption.`),
    p(`<strong>4. Ready-made posts and emails</strong> for each service, in the Resources tab.`),
    p(`<strong>5. Warm introductions.</strong> The best results come from introducing a client by email and copying us in at <a href="mailto:${ENV.affiliatesReplyTo}" style="color:#005fc2">${ENV.affiliatesReplyTo}</a>. Mention your code and we'll link the client to you.`),

    h2("Attached to this email"),
    `<ul style="margin:0 0 16px;padding-left:20px"><li><strong>Commission plan and program terms</strong>: rates, levels, payouts and all conditions.</li><li><strong>Partner quick guide</strong>: how to use your links, banners, videos and posts, with tips that work.</li></ul>`,
    p(`Your link remembers a visitor for ${COOKIE_DAYS} days, so a client who comes back later still counts as yours.`),
    p(`Questions? Just reply to this email and our partner team will help.`),
    p(`Welcome aboard,<br>The EGO Partner Team`),
  ].join("\n");

  const text = [
    `Hi ${first},`,
    "",
    "Welcome to the EGO Partner Program. Your account is active, so you can start sharing your link and earning commission today.",
    "",
    `Your referral code: ${o.code}`,
    `Your main link: ${mainLink}`,
    "",
    `Open your partner dashboard: ${o.dashboardUrl}`,
    `(Later, sign in any time at ${site}/affiliates/dashboard with this email address.)`,
    "",
    "WHAT YOU EARN (Partner / Pro / Elite)",
    ...COMMISSIONS.map((c) => `- ${c.label}: ${LEVELS.map((l) => `${c.rate + l.bonus}%`).join(" / ")}${c.type === "recurring" ? ` of each monthly payment for ${c.months} months` : " of the project"}`),
    `Pro: ${LEVELS[1].minClients}+ paying clients a year. Elite: ${LEVELS[2].minClients}+. Payouts monthly from ${money(MIN_PAYOUT)}.`,
    "",
    "YOUR LINKS",
    ...serviceLinks.map(([l, path]) => `- ${l}: ${site}${path}?ref=${o.code}`),
    "",
    "Banners, videos and ready-made posts are in the Resources tab of your dashboard.",
    "Attached: the commission plan and program terms, and the partner quick guide.",
    "",
    "Questions? Just reply to this email.",
    "",
    "The EGO Partner Team",
  ].join("\n");

  const html = layout({ heading: `Welcome to the EGO Partner Program, ${first}!`, bodyHtml, footnote: "You're receiving this because you applied to the EGO Partner Program." });
  return { subject: `Welcome to the EGO Partner Program, ${first}: your referral link is inside`, html, text };
}

export function partnerLoginEmail(link: string) {
  const text = `Here's your sign-in link for the EGO partner dashboard:\n${link}\n\nThe link works for 20 minutes. If you didn't ask for it, you can ignore this email.\n\nThe EGO Partner Team`;
  const html = layout({
    heading: "Sign in to your partner dashboard",
    bodyHtml: `<p style="margin:0 0 16px">Click the button below to sign in. The link works for 20 minutes.</p>`,
    ctaLabel: "Open my partner dashboard",
    ctaUrl: link,
    footnote: "If you didn't ask to sign in, you can safely ignore this email.",
  });
  return { subject: "Your EGO partner dashboard sign-in link", text, html };
}
