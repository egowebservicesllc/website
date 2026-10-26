/**
 * Single source of truth for business details and per-page SEO.
 * Used by the <Seo> component in the browser AND by scripts/prerender.mjs at
 * build time, so every route ships with correct <head> tags in its static HTML.
 */

import { LANDING_PAGES } from "./landing";
import { CLOUD_PAGES } from "./cloud";

export const SITE_URL = "https://www.egowebservices.com";
export const BRAND = "EGO Web Services";

/**
 * Cloud partnerships. Only `true` entries are described as partnerships on
 * the site. Flip `aws` / `azure` to true once those partnerships are
 * confirmed. Google only allows its Partner badge to be used under its
 * Partner Advantage guidelines: download the official badge from the
 * Partner Advantage portal, put it in /public/badges/ and set its path here.
 */
export const PARTNERS = {
  googleCloud: true,
  googleCloudBadge: "/badges/google-cloud.png",
  googleCloudIcon: "/badges/google-cloud-icon.png", // cloud symbol only, for small pills
  aws: false,
  awsBadge: "/badges/aws.png", // logo shown as a platform; "Partner" label only when aws is true
  azure: false,
  azureBadge: "/badges/azure.png", // logo shown as a platform; "Partner" label only when azure is true
  // Paste your Google Cloud Partner Advantage directory URL here to show a "View our partner profile" link.
  googleCloudProfileUrl: "https://cloud.google.com/find-a-partner/partner/ego-web-services-llc",
};

/** Google Cloud certifications held by the team (shown on /google-cloud). */
export const GOOGLE_CLOUD_CERTIFICATIONS = [
  { name: "Professional Cloud Architect", desc: "Designs secure, scalable and cost-efficient architectures on Google Cloud." },
  { name: "Associate Cloud Engineer", desc: "Deploys, monitors and operates workloads and projects on Google Cloud." },
];

/** Markets served (used in copy, structured data and the video). */
export const MARKETS = {
  short: "clients worldwide",
  long: "businesses worldwide",
};

export const BUSINESS = {
  legalName: "EGO Web Services LLC",
  email: "info@egowebservices.com",
  supportEmail: "support@egowebservices.com",
  // Add a public phone number here (e.g. "+16145550100") to show click-to-call
  // in the header, contact page, footer, sticky mobile bar and structured data.
  phone: "",
  phoneDisplay: "",
  street: "1496 Old Henderson Rd",
  city: "Columbus",
  region: "OH",
  regionName: "Ohio",
  postalCode: "43220",
  country: "US",
  foundingYear: 2016,
  // Track-record figures shown in the stat strips (Home, About, ad landing pages).
  projectsDelivered: 100,
  activeClients: 11,
  calendlyUrl: "https://calendly.com/egowebservices/30min",
  // Shown next to every quote CTA and in the form success message.
  // Change it if you can't commit to this turnaround.
  responseTime: "1 business day",
  social: [
    "https://www.linkedin.com/company/ego-web-services-llc/",
    "https://www.facebook.com/egowebservices/",
    "https://instagram.com/ego.web.services",
    "https://www.youtube.com/@egowebservices",
    "https://www.tiktok.com/@egowebservices",
  ],
};

/** Service ids used in /contact?service=… links, pricing tabs and the contact form. */
export const SERVICE_OPTIONS = [
  { id: "hosting", label: "Enterprise Hosting", servicesAnchor: "enterprise-hosting" },
  { id: "web-dev", label: "Web Development", servicesAnchor: "web-development" },
  { id: "mobile", label: "Mobile App", servicesAnchor: "mobile-development" },
  { id: "branding", label: "Branding & Design", servicesAnchor: "branding-design" },
  { id: "marketing", label: "Digital Marketing", servicesAnchor: "digital-marketing" },
  { id: "consulting", label: "Cloud Consulting & Migration", servicesAnchor: "it-consulting" },
] as const;

export type ServiceId = (typeof SERVICE_OPTIONS)[number]["id"];

export function serviceIdFromAnchor(anchor: string): ServiceId | undefined {
  return SERVICE_OPTIONS.find((s) => s.servicesAnchor === anchor)?.id;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PageSeo {
  path: string;
  /** Title without the brand; " | EGO Web Services" is appended once. */
  title: string;
  description: string;
  /** Label used in breadcrumbs structured data. */
  name: string;
  noindex?: boolean;
  faq?: FaqItem[];
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: "How much does a website cost with EGO Web Services?",
    a: "Starter websites begin at $1,500, business web applications at $4,000 and e-commerce platforms at $8,500. Every project starts with a free quote so you know the full price before any work begins.",
  },
  {
    q: "Are you a Google Cloud Partner?",
    a: "Yes. EGO Web Services is a Google Cloud Partner. We provide Google Cloud consulting, migration and managed services, and we also deliver on AWS and Microsoft Azure.",
  },
  {
    q: "Can you help us move to the cloud?",
    a: "Yes. We start with a cloud readiness assessment (from $2,000) that maps your systems, estimates costs and recommends Google Cloud, AWS or Azure for each workload, then migrate in tested stages from $5,500. Eligible Google Cloud migrations may qualify for Google incentives.",
  },
  {
    q: "Where do you work?",
    a: "Everywhere. We work with businesses worldwide, delivering remotely across time zones, and deploy on cloud regions around the globe. Prices are quoted in USD.",
  },
  {
    q: "Can you host and maintain the website you build?",
    a: "Yes. We offer managed hosting from $9/month up to dedicated servers and custom cloud setups, with automated backups, 24/7 monitoring and support from the same senior engineers who built your site.",
  },
  {
    q: "Who will actually work on my project?",
    a: "Senior engineers and designers. Your project is not sold by a partner and then handed to a junior team. You talk directly to the people doing the work, in plain English.",
  },
  {
    q: "How do I get started?",
    a: "Request a free quote or book a 30-minute call. We'll ask about your goals, timeline and budget, then send a clear proposal with fixed pricing and no hidden fees.",
  },
];

export const PRICING_FAQ: FaqItem[] = [
  {
    q: "Are these prices fixed?",
    a: "Hosting plans are fixed monthly prices. Project prices are starting points: after a free consultation we send a fixed quote for your exact scope, so there are no surprises.",
  },
  {
    q: "What are your starting prices for each service?",
    a: "Hosting from $9/month, cloud readiness assessments from $2,000, cloud migrations from $5,500, web development from $1,500, mobile apps from $6,000, branding from $950 and digital marketing from $1,200/month.",
  },
  {
    q: "Do you offer custom packages?",
    a: "Yes. Every service has a Custom tier for larger or unusual requirements. Tell us what you need and our engineers will put together a tailored proposal.",
  },
  {
    q: "Is support included?",
    a: "Managed hosting and managed cloud clients get 24/7 technical support. Development, design and consulting projects include post-launch support, and ongoing maintenance plans are available.",
  },
  {
    q: "Can Google help pay for our cloud migration?",
    a: "Possibly. As a Google Cloud Partner we can check whether your migration qualifies for Google Cloud programs such as the Rapid Migration and Modernization Program (RaMP), which can include credits and partner services funding. Incentives depend on eligibility and Google's approval.",
  },
];

export const PAGES: Record<string, PageSeo> = {
  "/": {
    path: "/",
    name: "Home",
    title: "Google Cloud Partner: Cloud Consulting, Migration & Web Development",
    description:
      "Google Cloud Partner serving businesses worldwide since 2016: cloud consulting & migration on Google Cloud, AWS and Azure, managed cloud, hosting and web development by senior engineers.",
    faq: HOME_FAQ,
  },
  "/services": {
    path: "/services",
    name: "Services",
    title: "Cloud Consulting, Hosting & Web Development Services",
    description:
      "Cloud consulting and migration on Google Cloud, AWS and Azure, enterprise hosting, web and mobile development, branding and digital marketing for businesses worldwide.",
  },
  "/pricing": {
    path: "/pricing",
    name: "Pricing",
    title: "Pricing: Cloud Migration, Hosting & Web Development",
    description:
      "Transparent pricing: cloud assessments from $2,000, cloud migrations from $5,500, hosting from $9/mo, websites from $1,500. See every package and get a free fixed quote.",
    faq: PRICING_FAQ,
  },
  "/portfolio": {
    path: "/portfolio",
    name: "Portfolio",
    title: "Portfolio & Case Studies",
    description:
      "See how EGO Web Services helps businesses scale cloud infrastructure, launch mobile apps, refresh their brand and generate qualified leads.",
  },
  "/about": {
    path: "/about",
    name: "About",
    title: "About Us: Cloud & Digital Agency Since 2016",
    description:
      "Founded in 2016, EGO Web Services is a Google Cloud Partner that builds, hosts and runs dependable technology for businesses worldwide, with senior engineers and plain-English communication.",
  },
  "/support": {
    path: "/support",
    name: "Support",
    title: "Technical Support",
    description:
      "Get help from the EGO Web Services engineering team. Open a support ticket, email support or chat with us. 24/7 support for managed hosting clients.",
  },
  "/contact": {
    path: "/contact",
    name: "Contact",
    title: "Contact Us: Get a Free Quote",
    description:
      "Tell us about your project and get a free, no-obligation quote. Or book a 30-minute call. We work with businesses worldwide.",
  },
  "/404": {
    path: "/404",
    name: "Page not found",
    title: "Page Not Found",
    description: "The page you were looking for doesn't exist.",
    noindex: true,
  },
};

PAGES["/thank-you"] = {
  path: "/thank-you",
  name: "Thank you",
  title: "Thank You: Request Received",
  description: "Thanks for contacting EGO Web Services. A senior engineer will be in touch shortly.",
  noindex: true,
};
PAGES["/privacy"] = {
  path: "/privacy",
  name: "Privacy Policy",
  title: "Privacy Policy",
  description: "How EGO Web Services collects, uses and protects personal information, including cookies and advertising technologies.",
};
PAGES["/terms"] = {
  path: "/terms",
  name: "Terms of Use",
  title: "Terms of Use",
  description: "Terms governing the use of the EGO Web Services website.",
};
for (const cp of CLOUD_PAGES) {
  PAGES[cp.path] = {
    path: cp.path,
    name: cp.navLabel,
    title: cp.metaTitle,
    description: cp.metaDescription,
    faq: cp.faq,
  };
}
for (const lp of LANDING_PAGES) {
  PAGES[`/lp/${lp.slug}`] = {
    path: `/lp/${lp.slug}`,
    name: lp.metaTitle,
    title: lp.metaTitle,
    description: lp.metaDescription,
    noindex: true, // ad landing pages: keep out of search results
    faq: lp.faq,
  };
}

/** Every route that gets a static HTML file at build time. */
export const PRERENDER_ROUTES = Object.keys(PAGES);

export const INDEXABLE_ROUTES = Object.values(PAGES)
  .filter((p) => !p.noindex)
  .map((p) => p.path);

export function fullTitle(title: string) {
  return title.includes(BRAND) ? title : `${title} | ${BRAND}`;
}

export function canonicalUrl(path: string) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Page-specific JSON-LD (business schema lives statically in index.html). */
export function pageJsonLd(page: PageSeo): object[] {
  const out: object[] = [];
  if (page.noindex) return out;
  if (page.path !== "/") {
    out.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: page.name, item: canonicalUrl(page.path) },
      ],
    });
  }
  if (page.faq?.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return out;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Head tags for one page, used by the build-time prerender. */
export function renderHeadTags(page: PageSeo): string {
  const t = esc(fullTitle(page.title));
  const d = esc(page.description);
  const url = canonicalUrl(page.path);
  const lines = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />`,
    page.noindex ? "" : `<link rel="canonical" href="${url}" />`,
    page.noindex ? "" : `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    ...pageJsonLd(page).map(
      (o) => `<script type="application/ld+json" data-page-ld>${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`,
    ),
  ];
  return lines.filter(Boolean).join("\n    ");
}
