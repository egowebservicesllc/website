/**
 * The partner program PDFs (commission plan & terms, and the quick guide),
 * built from src/lib/affiliates.ts so they always match the website.
 */
import { Pdf, decodePng, textWidth, type PdfImage } from "./pdf.js";
import { ENV } from "./env.js";
import { PACKAGE_SERVICES } from "../../src/lib/packages.js";
import {
  COMMISSIONS, COOKIE_DAYS, LEVELS, LINK_TARGETS, MAX_COMMISSION_PER_CLIENT, MIN_PAYOUT, REFUND_WINDOW_DAYS, RULES,
  commissionFor, money, priceValue,
} from "../../src/lib/affiliates.js";

const BLUE = "#005fc2";
const site = () => ENV.siteUrl.replace(/^https?:\/\//, "");
const EFFECTIVE = "November 22, 2026";

/** Logo files from the website (cached per function instance); null if unavailable. */
const logos = new Map<string, Promise<PdfImage | null>>();
function loadLogo(path: string) {
  if (!logos.has(path)) {
    logos.set(
      path,
      fetch(`${ENV.siteUrl}${path}`)
        .then(async (r) => (r.ok ? decodePng(Buffer.from(await r.arrayBuffer())) : null))
        .catch(() => null),
    );
  }
  return logos.get(path)!;
}

/** Blue cover band with the white logo, and a running header with the colour logo on later pages. */
async function brand(pdf: Pdf, eyebrow: string, title: string, subtitle: string, docName: string) {
  const [white, colour] = await Promise.all([loadLogo("/brand/ego-logo-horizontal-white.png"), loadLogo("/email/ego-logo.png")]);
  const colourIdx = colour ? pdf.addImage(colour) : -1;

  pdf.rect(0, 0, pdf.W, 214, BLUE);
  pdf.rect(0, 0, pdf.W, 6, "#0b1f3a");
  pdf.rect(0, 214, pdf.W, 4, "#60a5fa");
  // Decorative blocks on the right of the band.
  pdf.rect(pdf.W - 120, 6, 120, 208, "#0a6ad6");
  pdf.rect(pdf.W - 60, 6, 60, 208, "#1877e0");
  const whiteIdx = white ? pdf.addImage(white) : -1;
  if (whiteIdx >= 0) pdf.drawImage(whiteIdx, pdf.M, 38, 150);
  else {
    pdf.rect(pdf.M, 40, 26, 26, "#ffffff");
    pdf.rect(pdf.M + 9, 46, 8, 14, BLUE);
    pdf.text(pdf.M + 36, 59, "EGO Web Services", { size: 15, bold: true, color: "#ffffff" });
  }
  pdf.text(pdf.M, 122, eyebrow.toUpperCase(), { size: 9, bold: true, color: "#bfdbfe" });
  pdf.text(pdf.M, 152, title, { size: 24, bold: true, color: "#ffffff" });
  pdf.text(pdf.M, 180, subtitle, { size: 11, color: "#dbeafe" });
  pdf.y = 244;

  pdf.header = (p) => {
    if (colourIdx >= 0) p.drawImage(colourIdx, p.M, 22, 86);
    else p.text(p.M, 40, "EGO Web Services", { size: 11, bold: true, color: BLUE });
    p.text(p.W - p.M - textWidth(docName, 8.5), 40, docName, { size: 8.5, color: "#64748b" });
    p.line(p.M, 56, p.W - p.M, 56, "#cbd5e1", 0.6);
    p.y = 70;
  };
  return whiteIdx;
}

/** Closing panel: white logo on blue, with how to reach the partner team. */
function closing(pdf: Pdf, whiteIdx: number, title: string, lines: string[]) {
  const h = 58 + lines.length * 15;
  pdf.ensure(h + 16);
  pdf.y += 8;
  pdf.rect(pdf.M, pdf.y, pdf.contentWidth, h, BLUE);
  pdf.rect(pdf.M + pdf.contentWidth - 70, pdf.y, 70, h, "#0a6ad6");
  if (whiteIdx >= 0) pdf.drawImage(whiteIdx, pdf.M + 20, pdf.y + 18, 96);
  const x = pdf.M + 140;
  pdf.text(x, pdf.y + 30, title, { size: 13, bold: true, color: "#ffffff" });
  lines.forEach((l, i) => pdf.text(x, pdf.y + 50 + i * 15, l, { size: 10, color: "#dbeafe" }));
  pdf.y += h + 10;
}

function stats(pdf: Pdf, items: [string, string][]) {
  const gap = 10;
  const w = (pdf.contentWidth - gap * (items.length - 1)) / items.length;
  items.forEach(([big, small], i) => {
    const x = pdf.M + i * (w + gap);
    pdf.rect(x, pdf.y, w, 58, "#eff6ff");
    pdf.text(x + 12, pdf.y + 26, big, { size: 17, bold: true, color: BLUE });
    pdf.wrap(small, w - 24, 8.5).slice(0, 2).forEach((l, j) => pdf.text(x + 12, pdf.y + 41 + j * 10.5, l, { size: 8.5, color: "#334155" }));
  });
  pdf.y += 72;
}

const rateLabel = (rate: number, recurring: boolean, months?: number) => (recurring ? `${rate}% monthly for ${months} months` : `${rate}% of the project`);

/* ---------------- Commission plan & program terms ---------------- */

export async function planPdf(): Promise<Uint8Array> {
  const pdf = new Pdf();
  pdf.footer = `EGO Partner Program · Commission plan & terms · effective ${EFFECTIVE} · ${ENV.affiliatesReplyTo}`;
  const logo = await brand(pdf, "EGO Partner Program", "Commission Plan & Program Terms", `Effective ${EFFECTIVE} · ${site()}/affiliates`, "Commission plan & program terms");

  const top = Math.max(...COMMISSIONS.map((c) => c.rate)) + LEVELS[LEVELS.length - 1].bonus;
  stats(pdf, [
    [`Up to ${top}%`, "commission, depending on service and level"],
    [`${COOKIE_DAYS} days`, "referral tracking on every link"],
    [money(MIN_PAYOUT), "minimum payout, paid monthly"],
    ["Recurring", "commission on hosting and marketing"],
  ]);

  pdf.eyebrow("1. Commission by service");
  pdf.heading("What you earn on each service");
  pdf.para("Every partner starts on the Partner rate. Refer more paying clients in a rolling 12 months and your rate goes up on every service.", { color: "#334155" });
  pdf.table(
    ["Service", ...LEVELS.map((l) => `${l.name}${l.minClients ? ` (${l.minClients}+ clients/yr)` : " (start)"}`)],
    COMMISSIONS.map((c) => [c.label, ...LEVELS.map((l) => rateLabel(c.rate + l.bonus, c.type === "recurring", c.months))]),
    [1.5, 1, 1, 1],
  );

  pdf.heading("Example earnings at the Partner rate", 12.5);
  pdf.para("Based on our published starting prices. Larger projects pay more, because commission is a share of what the client actually pays.", { color: "#334155", size: 10 });
  const rows: string[][] = [];
  for (const c of COMMISSIONS) {
    const svc = PACKAGE_SERVICES.find((s) => s.id === c.serviceId);
    for (const p of svc?.packages || []) {
      const price = priceValue(p.price);
      if (!price) continue;
      const priceText = `${money(price)}${p.billing.trim().startsWith("/") ? p.billing.trim() : p.billing.trim() === "start" ? " (from)" : ""}`;
      rows.push([`${c.short}: ${p.name}`, priceText, money(commissionFor(c, price), true), c.type === "recurring" ? `over ${c.months} months` : "one-time"]);
    }
  }
  pdf.table(["Package", "Client pays", "You earn", "Paid"], rows, [2, 1.1, 1, 1], { size: 9 });

  pdf.eyebrow("2. Partner levels");
  pdf.heading("Levels and perks");
  pdf.table(
    ["Level", "Requirement", "Rate", "Perks"],
    LEVELS.map((l) => [l.name, l.minClients ? `${l.minClients}+ paying clients in the last 12 months` : "Everyone starts here", l.bonus ? `+${l.bonus}% on every service` : "Base rate", l.perks.join("; ")]),
    [0.8, 1.5, 1.1, 2.2],
  );
  pdf.para("Your level is checked every time a referred client pays. Each new client is paid at the level you had reached before that client, and higher levels apply to all services from then on. If your paying clients over the last 12 months fall below a level's requirement, new referrals are paid at the level you then qualify for.", { color: "#334155", size: 10 });

  pdf.eyebrow("3. Tracking");
  pdf.heading("How referrals are tracked");
  pdf.bullets([
    `Share any page of ${site()} with your code added, for example ${site()}/hosting?ref=yourcode. Your dashboard builds these links for you.`,
    `The link is remembered on the visitor's device for ${COOKIE_DAYS} days. If they send an enquiry, request a free offer or place an order within that time, the client is linked to you.`,
    "If a client used more than one partner's link, the first partner gets the referral.",
    `You can also introduce a client by email: copy ${ENV.affiliatesReplyTo} and mention your code. We'll link the client to you by hand.`,
    "A referral must be a new client of EGO Web Services. Existing clients, and people already talking to us before your referral, don't qualify.",
  ]);

  pdf.eyebrow("4. Earning and approval");
  pdf.heading("When commission is earned");
  pdf.bullets([
    "Project services (cloud consulting, web, apps, branding) earn a percentage of the client's first project. For custom quotes, it is the first signed project or first invoice.",
    "Recurring services (managed hosting, digital marketing) earn a percentage of each monthly payment for the months shown in the table, while the client keeps paying.",
    "Commission is calculated on the amount the client actually pays us, excluding taxes, payment fees and third-party costs passed through to the client, such as ad spend, cloud provider usage bills, domains and licences.",
    `Commission becomes Approved once the client has paid and the ${REFUND_WINDOW_DAYS}-day refund window has passed. If a payment is refunded or charged back, the related commission is cancelled or deducted from future payouts.`,
    `Commission is capped at ${money(MAX_COMMISSION_PER_CLIENT)} per referred client. Larger enterprise deals can be agreed separately in writing.`,
  ]);

  pdf.eyebrow("5. Payouts");
  pdf.heading("How you get paid");
  pdf.bullets([
    `Approved commission is paid in the first week of each month once your approved balance reaches ${money(MIN_PAYOUT)}. Smaller balances roll over to the next month.`,
    "Payouts are made in US dollars by bank transfer, Wise or Stripe. Tell us your preferred method by replying to your welcome email.",
    "You are responsible for any taxes on your commission in your country. We may ask for basic tax or identity details before the first payout.",
    "Elite partners can ask for payouts twice a month.",
  ]);

  pdf.eyebrow("6. Promotion rules");
  pdf.heading("How you may promote us");
  pdf.bullets(RULES.slice(5).concat([
    "Make it clear that you may earn a commission when you recommend us (for example \"I may earn a referral fee\").",
    "Use only our official banners, videos, logos and descriptions, without changing them, and don't present yourself as EGO Web Services or as our employee.",
    "Don't promise prices, discounts, delivery dates or results on our behalf. We quote every project ourselves.",
    "No unsolicited bulk email or messages, no cookie stuffing, no forced clicks and no buying traffic that hides where it came from.",
  ]));

  pdf.eyebrow("7. General terms");
  pdf.heading("The legal bits, in plain English");
  pdf.bullets([
    "You join as an independent partner. The program doesn't create employment, a partnership or a joint venture, and you can't sign agreements for us.",
    "We may change commission rates or these terms with 30 days' notice by email. Changes never reduce commission already earned.",
    "Either side can leave the program at any time. Approved commission is still paid, unless the account is closed for breaking these rules or for fraud, in which case unpaid commission is forfeited.",
    "We decide whether a client qualifies as your referral using our tracking and records. If two partners claim the same client, the first tracked referral counts.",
    "Keep any non-public information about our clients, prices or plans confidential.",
    "By applying to the program you accept these terms.",
  ]);

  closing(pdf, logo, "Questions? We're here to help.", [`Email ${ENV.affiliatesReplyTo} or reply to your welcome email.`, `Your dashboard: ${site()}/affiliates/dashboard`, "Google Cloud Partner · Building for clients since 2016"]);
  return pdf.build("EGO Partner Program: Commission Plan & Terms");
}

/* ---------------- Quick guide ---------------- */

export async function guidePdf(): Promise<Uint8Array> {
  const pdf = new Pdf();
  pdf.footer = `EGO Partner Program · Quick guide · ${ENV.affiliatesReplyTo}`;
  const logo = await brand(pdf, "EGO Partner Program", "Partner Quick Guide", "Everything you need to start referring clients, in 5 minutes", "Partner quick guide");

  pdf.eyebrow("Start here");
  pdf.heading("Your first 5 minutes");
  pdf.table(
    ["Step", "What to do"],
    [
      ["1. Find your code", "It's in your welcome email and at the top of your dashboard, for example sarah-7f3a."],
      ["2. Open your dashboard", `${site()}/affiliates/dashboard. Sign in with the email you applied with; we email you a one-click link.`],
      ["3. Copy a link", "Open the Referral links tab, choose a page, copy. Every link already carries your code."],
      ["4. Share it", "Post it, email it, add it to your website, or introduce a client by email and copy us in."],
      ["5. Track it", "Every enquiry from your link shows up in Referrals with its status and your commission."],
    ],
    [1, 3],
  );

  pdf.eyebrow("Tool 1");
  pdf.heading("Referral links");
  pdf.para("Add ?ref=yourcode to any page on our site. Link to the page that matches what your contact needs; it converts far better than the homepage.", { color: "#334155" });
  pdf.table(["Page", "Link"], LINK_TARGETS.map((t) => [t.label, `${site()}${t.path}?ref=yourcode`]), [1, 2.2], { size: 9 });
  pdf.para("Tip: give each place you share a campaign name in the link builder (for example \"linkedin-post\" or \"newsletter\"), so you can see which channel works.", { color: "#334155", size: 10 });

  pdf.eyebrow("Tool 2");
  pdf.heading("Banners");
  pdf.para("Ready-made banners are in the Resources tab of your dashboard. Each one has a Download button and a Copy embed code button; the embed code already contains your link.", { color: "#334155" });
  pdf.table(
    ["Banner", "Size", "Best for"],
    [
      ["Social post", "1200 × 628", "LinkedIn, Facebook and X posts, blog headers"],
      ["Square post", "1080 × 1080", "Instagram and LinkedIn feed"],
      ["Story", "1080 × 1920", "Instagram, Facebook and WhatsApp stories"],
      ["Leaderboard", "728 × 90", "Website headers and footers"],
      ["Medium rectangle", "300 × 250", "Website sidebars and newsletters"],
    ],
    [1.2, 1, 2.4],
  );
  pdf.para("On a website, paste the embed code where you want the banner. On social media, download the image, post it, and put your link in the post text or the first comment.", { color: "#334155", size: 10 });

  pdf.eyebrow("Tool 3");
  pdf.heading("Videos");
  pdf.bullets([
    `Company promo (16:9): ${site()}/videos/ego-promo-16x9.mp4`,
    `Google Cloud promo (16:9): ${site()}/videos/ego-google-cloud-16x9.mp4`,
    "Download the video, upload it natively to LinkedIn, YouTube, Facebook or Instagram (native videos reach more people than links), and add your referral link in the caption.",
  ]);

  pdf.eyebrow("Tool 4");
  pdf.heading("Ready-made posts and emails");
  pdf.para("The Resources tab has a short recommendation for each service, with your link included. Copy, adjust it to your own voice, and share. A warm introduction email works best:", { color: "#334155" });
  pdf.callout(
    "Introduction email template",
    `Hi [name], meet the team at EGO Web Services (copied). They're a Google Cloud Partner I trust for [cloud / hosting / websites / apps / branding / marketing]. [Client name] is looking for [what they need]. I'll let you take it from here. Partner code: yourcode. Copy ${ENV.affiliatesReplyTo} so we can link the client to you.`,
  );

  pdf.eyebrow("Who to approach");
  pdf.heading("Who each service is for");
  pdf.table(["Service", "Great fit", "You earn (Partner)"], COMMISSIONS.map((c) => [c.label, c.pitch, rateLabel(c.rate, c.type === "recurring", c.months)]), [1.2, 2.4, 1.2], { size: 9 });
  pdf.para("Easy door-openers: the free cloud cost review and the free website check. They cost the client nothing and often turn into projects, and both count as referrals.", { color: "#334155", size: 10 });

  pdf.eyebrow("Your dashboard");
  pdf.heading("What each status means");
  pdf.table(
    ["Status", "Meaning"],
    [
      ["Lead", "The client got in touch through your link. We're talking to them."],
      ["Quoted", "We've sent a proposal or quote."],
      ["Paid", `The client has paid. Commission is pending for the ${REFUND_WINDOW_DAYS}-day refund window.`],
      ["Approved", "The refund window has passed. This commission will be in your next payout."],
      ["Paid out", "We've sent you this commission."],
      ["Lost", "The client didn't go ahead. Keep going; it happens."],
    ],
    [1, 3.5],
  );

  pdf.eyebrow("Do and don't");
  pdf.heading("Tips that work");
  pdf.bullets([
    "Do recommend us to people you know need the service. Personal recommendations convert best.",
    "Do say that you may earn a referral fee. It builds trust and it's required in many countries.",
    "Do use the page that fits the need, plus a sentence about why you recommend us.",
    "Don't spam groups, inboxes or comment sections, and don't run ads on our brand name.",
    "Don't promise prices or discounts; we'll give the client a fixed quote within one business day.",
  ]);
  closing(pdf, logo, "Need help or custom material?", [`Reply to your welcome email or write to ${ENV.affiliatesReplyTo}.`, "Pro and Elite partners can ask for co-branded proposals.", `${site()}/affiliates/dashboard`]);
  return pdf.build("EGO Partner Quick Guide");
}
