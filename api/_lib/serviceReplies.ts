/**
 * Service-specific auto-reply, sent from info@egowebservices.com to everyone
 * who contacts us or buys, in addition to the instant confirmation from
 * notifications@. It tells the client what happens next for *their* service,
 * what to send us to start faster, and where to read more.
 *
 * Wording sticks to facts published on the website (prices, inclusions,
 * response time). No delivery dates are promised beyond the first reply.
 */
import { ENV } from "./env.js";
import { layout, textToHtml } from "./email.js";

export interface ServiceReplyInput {
  name: string;
  ref: string;
  serviceId?: string; // consulting | hosting | web-dev | mobile | branding | marketing
  packageName?: string;
  page?: string; // page the form was sent from, e.g. /aws
  message?: string;
  paid?: boolean; // true after a Buy-now payment
}

interface Topic {
  id: string;
  label: string; // "Shared hosting"
  next: string[]; // what happens next (lead)
  nextPaid?: string[]; // what happens next (after payment)
  need: string[]; // what to send us
  links: [string, string][]; // [label, path]
}

const S = (p: string) => `${ENV.siteUrl}${p}`;
const R = () => ENV.responseTime;

const TOPICS: Record<string, Topic> = {
  // ---------- Cloud consulting & migration ----------
  assessment: {
    id: "assessment", label: "Cloud Readiness Assessment",
    next: [
      "A senior cloud engineer reviews your request and replies with a few scoping questions.",
      "We agree a short kickoff call and confirm the fixed price ($2,000).",
      "You receive an inventory of your systems, a monthly cloud cost estimate, the recommended platform and a written migration roadmap.",
    ],
    nextPaid: [
      "A senior cloud engineer contacts you to book the kickoff call.",
      "We request read-only access to your current environment (we'll send exact, safe instructions).",
      "You receive your report: security review, cost estimate, recommended platform and migration roadmap.",
    ],
    need: ["A rough list of your servers, apps and databases (even a spreadsheet or screenshot helps)", "Where they run today (office servers, a data centre, another cloud)", "Any deadline, such as a contract or hardware renewal", "Compliance needs, if any (for example healthcare, finance or data residency)"],
    links: [["Google Cloud migration cost guide", "/blog/google-cloud-migration-cost"], ["Cloud migration services", "/cloud-migration"]],
  },
  gcp: {
    id: "gcp", label: "Google Cloud",
    next: ["A certified Google Cloud engineer reviews your request.", "We reply with questions about your workloads and goals and suggest a short call.", "You get a clear recommendation and a fixed quote. As a Google Cloud Partner we also check whether Google funding (such as RaMP credits) could apply."],
    need: ["What you want to run or move to Google Cloud", "Whether you already have a Google Cloud account or use Google Workspace", "Rough size: number of servers, apps or users", "Any deadline or budget range"],
    links: [["Google Cloud services", "/google-cloud"], ["Google Cloud migration cost guide", "/blog/google-cloud-migration-cost"]],
  },
  aws: {
    id: "aws", label: "AWS",
    next: ["A senior engineer with AWS experience reviews your request.", "We reply with a few questions and suggest a short call.", "You get a clear plan and fixed quote, whether it's a migration, a cost review or managed AWS."],
    need: ["What you run on AWS today, or want to move there", "Your current monthly AWS bill, if you'd like a cost review", "Any security or compliance requirements", "Your timeline"],
    links: [["AWS consulting", "/aws"], ["AWS vs Google Cloud vs Azure guide", "/blog/aws-vs-google-cloud-vs-azure"]],
  },
  azure: {
    id: "azure", label: "Microsoft Azure",
    next: ["A senior engineer with Microsoft Azure experience reviews your request.", "We reply with a few questions and suggest a short call.", "You get a clear plan and fixed quote, including whether your existing Microsoft licences can lower the cost (Azure Hybrid Benefit)."],
    need: ["Your Microsoft setup: Microsoft 365, Windows Server, SQL Server, Active Directory", "What you'd like to move or build on Azure", "Number of users and servers", "Your timeline"],
    links: [["Microsoft Azure services", "/azure"], ["AWS vs Google Cloud vs Azure guide", "/blog/aws-vs-google-cloud-vs-azure"]],
  },
  managed: {
    id: "managed", label: "Managed cloud",
    next: ["A senior engineer reviews your current setup and goals.", "We suggest a short call to understand what needs monitoring, securing and optimising.", "You get a managed plan with a clear monthly scope and price."],
    need: ["Which cloud(s) you use today", "Roughly what you spend per month", "Your biggest pain point: cost, security, downtime or lack of in-house skills", "Who should receive alerts and reports"],
    links: [["Managed cloud", "/managed-cloud"], ["Pricing", "/pricing"]],
  },
  migration: {
    id: "migration", label: "Cloud migration",
    next: ["A senior cloud engineer reviews your request.", "We reply with scoping questions and suggest a short call.", "You get a written plan and fixed quote. If you're not sure what you have, we usually start with the $2,000 readiness assessment."],
    need: ["What you want to move: servers, apps, databases, file shares", "Where it runs today and which cloud you're considering", "How much downtime is acceptable", "Any deadline"],
    links: [["Cloud migration services", "/cloud-migration"], ["Google Cloud migration cost guide", "/blog/google-cloud-migration-cost"]],
  },
  // ---------- Hosting ----------
  shared: {
    id: "shared", label: "Shared hosting",
    next: ["We confirm the plan suits your site (most brochure sites and blogs fit well).", "We set up your hosting account with cPanel or Plesk, free SSL and daily backups.", "We send your access details and the DNS settings to point your domain."],
    nextPaid: ["We set up your hosting account with your chosen control panel, free SSL and daily backups.", "You receive your access details and DNS settings by email (passwords are shared separately and securely).", "If you have an existing site, we help you move it."],
    need: ["Your domain name and where it's registered", "Your preferred control panel: cPanel or Plesk", "If you have a site already: where it's hosted now and what it runs on (for example WordPress)"],
    links: [["Shared vs VPS vs dedicated guide", "/blog/shared-vs-vps-vs-dedicated-hosting"], ["Hosting plans", "/pricing"]],
  },
  vps: {
    id: "vps", label: "VPS hosting",
    next: ["We confirm the right size for your site or app.", "We set up your VPS with your chosen control panel or full root/SSH access, backups and monitoring.", "We send your access details and help move any existing site."],
    nextPaid: ["We set up your VPS with your chosen control panel or full root/SSH access, daily backups and monitoring.", "You receive your server details by email (passwords or SSH keys are shared separately and securely).", "If you have an existing site or app, we help you move it."],
    need: ["What will run on the server (WordPress, an online shop, a custom app…)", "Control panel preference: cPanel/WHM, Plesk, or no panel with root access", "Your domain name", "For root access: your public SSH key, if you have one"],
    links: [["Shared vs VPS vs dedicated guide", "/blog/shared-vs-vps-vs-dedicated-hosting"], ["Hosting plans", "/pricing"]],
  },
  dedicated: {
    id: "dedicated", label: "Dedicated server",
    next: ["We confirm the hardware and setup your workload needs.", "We provision the server with your chosen panel or root access, backups and monitoring.", "We send your access details and plan any migration with you."],
    nextPaid: ["We provision your dedicated server with your chosen panel or root access, backups and monitoring.", "You receive your server details by email (credentials are shared separately and securely).", "We plan the move of any existing systems with you."],
    need: ["What the server will run and expected traffic", "Operating system and control panel preference", "Any security or compliance requirements", "For root access: your public SSH key"],
    links: [["Shared vs VPS vs dedicated guide", "/blog/shared-vs-vps-vs-dedicated-hosting"], ["Hosting plans", "/pricing"]],
  },
  cloudhosting: {
    id: "cloudhosting", label: "Cloud hosting",
    next: ["A senior engineer reviews what you want to host.", "We recommend Google Cloud, AWS or Azure and a setup sized to your traffic.", "You get a clear monthly estimate and a fixed setup price."],
    need: ["What you want to host and expected traffic", "Any preferred cloud provider or region", "Uptime and scaling requirements"],
    links: [["Cloud regions", "/cloud-regions"], ["Managed cloud", "/managed-cloud"]],
  },
  hosting: {
    id: "hosting", label: "Hosting",
    next: ["We review your site and recommend shared, VPS or dedicated hosting.", "We set up your account with free SSL, daily backups and 24/7 monitoring.", "We send your access details and help move any existing site."],
    need: ["Your website address, or what you're planning to host", "Roughly how many visitors you get", "Where it's hosted today, if anywhere"],
    links: [["Shared vs VPS vs dedicated guide", "/blog/shared-vs-vps-vs-dedicated-hosting"], ["Hosting plans", "/pricing"]],
  },
  // ---------- Web development ----------
  website: {
    id: "website", label: "Website",
    next: ["A senior developer reviews your request.", "We reply with a few questions about pages, content and features, or book a short call.", "You get a fixed quote and proposed timeline. Starter websites begin at $1,500."],
    need: ["Your current website (if any) and 2–3 websites you like", "The pages you need (for example Home, Services, About, Contact)", "Whether you have text, photos and a logo ready", "Any features: booking, forms, blog, multiple languages"],
    links: [["Our work", "/portfolio"], ["Web development pricing", "/pricing"]],
  },
  webapp: {
    id: "webapp", label: "Web application",
    next: ["A senior developer reviews your request.", "We book a short call to understand users, workflows and integrations.", "You get a scoped proposal with a fixed quote. Business applications start at $4,000."],
    need: ["What the app should do and who will use it", "Any systems it must connect to (payments, CRM, accounting…)", "Examples of similar tools you like", "Your timeline and budget range"],
    links: [["Our work", "/portfolio"], ["Pricing", "/pricing"]],
  },
  ecommerce: {
    id: "ecommerce", label: "Online shop",
    next: ["A senior developer reviews your request.", "We book a short call about products, payments and shipping.", "You get a fixed quote and plan. E-commerce platforms start at $8,500."],
    need: ["Roughly how many products you sell", "Payment and shipping methods you need", "Any current shop platform (Shopify, WooCommerce…) and stock system", "Shops you like the look of"],
    links: [["Our work", "/portfolio"], ["Pricing", "/pricing"]],
  },
  // ---------- Mobile ----------
  mobile: {
    id: "mobile", label: "Mobile app",
    next: ["A senior developer reviews your idea.", "We book a short call to agree the essential features for a first version.", "You get a proposal and fixed quote. MVP apps start at $6,000."],
    need: ["What the app does and who it's for", "iPhone, Android or both", "Must-have features for version 1", "Any designs, sketches or similar apps you like"],
    links: [["Our work", "/portfolio"], ["Pricing", "/pricing"]],
  },
  // ---------- Branding ----------
  logo: {
    id: "logo", label: "Logo design",
    next: ["A designer reviews your request.", "We send a short brand questionnaire.", "You receive 3 logo concepts to choose from, then high-res files, brand colours and a typography guide."],
    nextPaid: ["A designer sends you a short brand questionnaire.", "Once it's answered, we design 3 logo concepts for your feedback.", "You receive the final high-res files, brand colours and a typography guide."],
    need: ["Your business name exactly as it should appear (and any slogan)", "What you do and who your customers are", "Logos or styles you like, and any you don't", "Colours you love or want to avoid"],
    links: [["Our work", "/portfolio"], ["Branding packages", "/pricing"]],
  },
  brand: {
    id: "brand", label: "Brand identity",
    next: ["A designer reviews your request.", "We send a brand questionnaire and suggest a short call.", "You receive your full brand: logo, design system, stationery kit, social media guide and brand story."],
    nextPaid: ["A designer sends you a brand questionnaire and books a short call.", "We design your logo and brand system for your feedback.", "You receive the full brand kit: design system, stationery, social media guide and brand story."],
    need: ["Your business name, what you do and who your customers are", "Your mission and personality in a few words", "Brands you admire", "Where the brand will be used (website, social, packaging, signage)"],
    links: [["Our work", "/portfolio"], ["Branding packages", "/pricing"]],
  },
  video: {
    id: "video", label: "Video & animation",
    next: ["A designer reviews your request.", "We reply with questions about length, style and where the video will be shown.", "You get a fixed quote and a storyboard plan."],
    need: ["What the video should explain or promote", "Length and formats (for example a 30-second ad in 16:9 and 9:16)", "Your logo, brand colours and any footage", "Videos you like the style of"],
    links: [["Our work", "/portfolio"], ["Services", "/services"]],
  },
  branding: {
    id: "branding", label: "Branding & design",
    next: ["A designer reviews your request.", "We send a short questionnaire about your business and style.", "You get a fixed quote. Logos start at $950 and full brands at $2,800."],
    need: ["Your business name and what you do", "What you need: logo, full brand, social graphics, print or video", "Examples of designs you like"],
    links: [["Our work", "/portfolio"], ["Branding packages", "/pricing"]],
  },
  // ---------- Marketing ----------
  seo: {
    id: "seo", label: "SEO",
    next: ["A marketing specialist looks at your website and current Google visibility.", "We reply with first findings and suggest a short call.", "You get a plan with the keywords to target and a monthly price."],
    need: ["Your website address", "Your main services and the areas you serve", "Your main competitors", "Access to Google Search Console and Analytics, if you have them (read-only is fine)"],
    links: [["Digital marketing", "/services#digital-marketing"], ["Marketing pricing", "/pricing"]],
  },
  ppc: {
    id: "ppc", label: "Paid ads (Google, Meta, LinkedIn)",
    next: ["A marketing specialist reviews your goals and any current campaigns.", "We suggest a short call about budget, audience and offers.", "You get a campaign plan with expected costs and a monthly management price."],
    need: ["What you want more of: calls, leads, bookings or sales", "Your monthly ad budget", "Access to existing ad accounts, if any", "Your website or landing page"],
    links: [["Digital marketing", "/services#digital-marketing"], ["Marketing pricing", "/pricing"]],
  },
  social: {
    id: "social", label: "Social media",
    next: ["A marketing specialist reviews your current social profiles.", "We suggest a short call about your audience and goals.", "You get a content plan and monthly price. Social Starter begins at $1,200/month."],
    need: ["Links to your social profiles", "Which platforms matter most to you", "Your brand assets: logo, colours, photos", "Posts or brands you like"],
    links: [["Digital marketing", "/services#digital-marketing"], ["Marketing pricing", "/pricing"]],
  },
  marketing: {
    id: "marketing", label: "Digital marketing",
    next: ["A marketing specialist reviews your website and goals.", "We suggest a short call to agree what to focus on: SEO, ads, social or all three.", "You get a plan with a clear monthly price."],
    need: ["Your website and social profiles", "What you want more of: leads, sales or bookings", "Your monthly budget range"],
    links: [["Digital marketing", "/services#digital-marketing"], ["Marketing pricing", "/pricing"]],
  },
  // ---------- Fallback ----------
  general: {
    id: "general", label: "your project",
    next: ["A senior member of our team reviews your message.", "We reply with any questions, or suggest a short call.", "You get a clear recommendation and a fixed quote."],
    need: ["A few lines about your business and what you want to achieve", "Any deadline or budget range", "Links to your current website or examples you like"],
    links: [["Our services", "/services"], ["Pricing", "/pricing"]],
  },
};

/** Pick the most specific topic from the package, the page the form was on, and the message. */
export function topicFor(i: Pick<ServiceReplyInput, "serviceId" | "packageName" | "page" | "message">): Topic {
  const pkg = (i.packageName || "").toLowerCase();
  const page = (i.page || "").toLowerCase();
  const msg = (i.message || "").toLowerCase();
  const has = (re: RegExp) => re.test(pkg) || re.test(msg);
  switch (i.serviceId) {
    case "consulting":
      if (/readiness|assessment/.test(pkg)) return TOPICS.assessment;
      if (/managed/.test(pkg) || page.includes("managed-cloud")) return TOPICS.managed;
      if (page.includes("/aws") || /\baws\b|amazon/.test(msg)) return TOPICS.aws;
      if (page.includes("/azure") || /azure|microsoft/.test(msg)) return TOPICS.azure;
      if (page.includes("google-cloud") || /google cloud|\bgcp\b|bigquery|gke/.test(msg)) return TOPICS.gcp;
      return TOPICS.migration;
    case "hosting":
      if (/basic|shared/.test(pkg)) return TOPICS.shared;
      if (/vps/.test(pkg)) return TOPICS.vps;
      if (/dedicated/.test(pkg)) return TOPICS.dedicated;
      if (/custom cloud/.test(pkg)) return TOPICS.cloudhosting;
      if (has(/\bvps\b|virtual private/)) return TOPICS.vps;
      if (has(/dedicated/)) return TOPICS.dedicated;
      if (has(/shared/)) return TOPICS.shared;
      return TOPICS.hosting;
    case "web-dev":
      if (/e-?commerce|shop/.test(pkg) || /online (shop|store)|e-?commerce|shopify|woocommerce/.test(msg)) return TOPICS.ecommerce;
      if (/application|enterprise/.test(pkg) || /web ?app|portal|dashboard|saas/.test(msg)) return TOPICS.webapp;
      return TOPICS.website;
    case "mobile":
      return TOPICS.mobile;
    case "branding":
      if (/logo/.test(pkg)) return TOPICS.logo;
      if (/complete brand|strategy|corporate/.test(pkg)) return TOPICS.brand;
      if (/video|animation|motion/.test(msg)) return TOPICS.video;
      if (/logo/.test(msg)) return TOPICS.logo;
      if (/brand/.test(msg)) return TOPICS.brand;
      return TOPICS.branding;
    case "marketing":
      if (/\bseo\b|search engine|rank/.test(msg)) return TOPICS.seo;
      if (/\bppc\b|google ads|ads\b|advert|meta ads|facebook ads|linkedin ads/.test(msg)) return TOPICS.ppc;
      if (/social|instagram|tiktok|facebook|linkedin/.test(msg) || /social/.test(pkg)) return TOPICS.social;
      return TOPICS.marketing;
    default:
      return TOPICS.general;
  }
}

/** The email itself (from info@). */
export function serviceReplyEmail(i: ServiceReplyInput) {
  const t = topicFor(i);
  const first = (i.name || "").trim().split(/\s+/)[0] || "there";
  const steps = i.paid && t.nextPaid ? t.nextPaid : t.next;
  const [about, short] = PHRASE[t.id] || PHRASE.general;
  const intro = i.paid
    ? `Thank you for your order${i.packageName ? ` for ${i.packageName}` : ""}. Here's exactly how we'll get started, and what we need from you.`
    : `Thanks for reaching out about ${about}. Here's what happens next, and how to speed things up.`;
  const links = [...t.links, ["Book a 30-minute call", "__calendly"]] as [string, string][];
  const linkUrl = (p: string) => (p === "__calendly" ? ENV.calendlyUrl : S(p));
  const close = i.paid
    ? `You can follow your order, message us and upload files in your client portal: ${ENV.portalUrl}`
    : `You'll hear from us within ${R()}. If anything is urgent, just reply to this email.`;

  const text = [
    `Hi ${first},`,
    "",
    intro,
    "",
    "What happens next",
    ...steps.map((s, n) => `${n + 1}. ${s}`),
    "",
    i.paid ? "To get started, please reply with" : "To get started faster, reply with",
    ...t.need.map((s) => `• ${s}`),
    "",
    "Useful links",
    ...links.map(([l, p]) => `• ${l}: ${linkUrl(p)}`),
    "",
    close,
    "",
    "Best regards,",
    ENV.signatureName,
    "info@egowebservices.com",
    "",
    `Reference: ${i.ref}`,
  ].join("\n");

  const li = (arr: string[], ordered: boolean) =>
    `<${ordered ? "ol" : "ul"} style="margin:0 0 20px;padding-left:22px;font-size:15px;line-height:1.7;color:#334155">${arr.map((s) => `<li style="margin:0 0 6px">${esc(s)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`;
  const h = (s: string) => `<p style="margin:0 0 8px;font-weight:800;font-size:16px;color:#0f172a">${esc(s)}</p>`;
  const bodyHtml =
    textToHtml(`Hi ${first},\n\n${intro}`) +
    h("What happens next") + li(steps, true) +
    h(i.paid ? "To get started, please reply with" : "To get started faster, reply with") + li(t.need, false) +
    h("Useful links") +
    `<ul style="margin:0 0 20px;padding-left:22px;font-size:15px;line-height:1.7">${links.map(([l, p]) => `<li><a href="${linkUrl(p)}" style="color:#005fc2;font-weight:600">${esc(l)}</a></li>`).join("")}</ul>` +
    textToHtml(`${close}\n\nBest regards,\n${ENV.signatureName}\ninfo@egowebservices.com`);
  const html = layout({
    heading: i.paid ? `Getting your ${short} started` : `Next steps for your ${short} request`,
    bodyHtml,
    ctaLabel: i.paid ? "Open your client portal" : "Book a 30-minute call",
    ctaUrl: i.paid ? ENV.portalUrl : ENV.calendlyUrl,
    footnote: `Reference ${i.ref}. Simply reply to this email: it goes straight to our team.`,
  });
  const subject = i.paid
    ? `Getting your ${short} started (${i.ref})`
    : `Next steps for your ${short} request (${i.ref})`;
  return { subject, text, html, topic: t.id };
}

/** [how the intro names it, short name for headings and subjects] */
const PHRASE: Record<string, [string, string]> = {
  assessment: ["a Cloud Readiness Assessment", "Cloud Readiness Assessment"],
  gcp: ["Google Cloud", "Google Cloud"],
  aws: ["AWS", "AWS"],
  azure: ["Microsoft Azure", "Microsoft Azure"],
  managed: ["managed cloud", "managed cloud"],
  migration: ["a cloud migration", "cloud migration"],
  shared: ["shared hosting", "shared hosting"],
  vps: ["VPS hosting", "VPS hosting"],
  dedicated: ["a dedicated server", "dedicated server"],
  cloudhosting: ["cloud hosting", "cloud hosting"],
  hosting: ["web hosting", "hosting"],
  website: ["a new website", "website"],
  webapp: ["a web application", "web application"],
  ecommerce: ["an online shop", "online shop"],
  mobile: ["a mobile app", "mobile app"],
  logo: ["logo design", "logo design"],
  brand: ["a brand identity", "brand identity"],
  video: ["video and animation", "video"],
  branding: ["branding and design", "branding"],
  seo: ["SEO", "SEO"],
  ppc: ["paid advertising", "ads campaign"],
  social: ["social media marketing", "social media"],
  marketing: ["digital marketing", "digital marketing"],
  general: ["your project", "project"],
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
