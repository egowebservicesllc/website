/**
 * Paid-ads landing pages: /lp/<slug>.
 *
 * One page per service so the ad and the page say the same thing (message
 * match). Point each campaign's final URL at its page and add UTM tags, e.g.
 *   https://www.egowebservices.com/lp/cloud-consulting?utm_source=linkedin&utm_medium=paid_social&utm_campaign=cloud-q4
 *
 * These pages are noindex (ads only) and kept out of the sitemap, so they don't
 * compete with the main site in Google search. Edit copy freely here.
 */
import type { FaqItem, ServiceId } from "@/lib/site";

export interface LandingPageConfig {
  slug: string;
  serviceId: ServiceId;
  /** Browser tab / share title. */
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  /** Part of the headline shown in brand blue. */
  highlight: string;
  subheadline: string;
  bullets: string[];
  priceFrom: string;
  benefits: { title: string; desc: string }[];
  faq: FaqItem[];
  image: string;
  imageAlt: string;
}

const commonFaq: FaqItem[] = [
  {
    q: "Is the quote really free?",
    a: "Yes. You tell us what you need, we send a clear proposal with fixed pricing. There's no obligation and no pressure to sign.",
  },
  {
    q: "Do you work with businesses outside Columbus?",
    a: "Yes. We're based in Columbus, Ohio and work with clients across the US and internationally, remotely or in person.",
  },
];

export const LANDING_PAGES: LandingPageConfig[] = [
  {
    slug: "cloud-consulting",
    serviceId: "consulting",
    metaTitle: "Cloud Consulting & Migration",
    metaDescription:
      "Senior cloud engineers plan and run your migration, audit your infrastructure and cut waste. Technical audits from $2,000. Free consultation.",
    eyebrow: "Cloud Consulting & Migration",
    headline: "Move to the cloud",
    highlight: "without the downtime or the jargon.",
    subheadline:
      "Senior engineers audit your infrastructure, plan your migration and set it up properly, with security, backups and a clear roadmap your team can actually follow.",
    bullets: [
      "Cloud architecture & migration planning",
      "Infrastructure, security & cost audits",
      "Backup & disaster-recovery protocols",
      "CTO-level advice without a full-time hire",
    ],
    priceFrom: "Technical audits from $2,000 · Migrations from $5,500",
    benefits: [
      { title: "A plan before any change", desc: "We review your current setup first and hand you a written migration plan, so nothing moves until you know the cost, risk and timeline." },
      { title: "Engineers, not salespeople", desc: "Your project is run by the senior engineers doing the work, explaining every decision in plain English." },
      { title: "Supported after go-live", desc: "We train your staff and stay on for hosting, monitoring and 24/7 support if you need it." },
    ],
    faq: [
      { q: "Which cloud platforms do you work with?", a: "We design and migrate on the major public clouds as well as hybrid and multi-region setups. We'll recommend the platform that fits your workload and budget, not the one we prefer." },
      { q: "Will my systems go down during migration?", a: "Migrations are planned to avoid downtime: we stage, test and cut over in controlled steps with a rollback plan and backups in place." },
      ...commonFaq,
    ],
    image: "/images/server-room.jpg",
    imageAlt: "Server racks in a data center",
  },
  {
    slug: "managed-hosting",
    serviceId: "hosting",
    metaTitle: "Managed Business Hosting from $9/mo",
    metaDescription:
      "Fast, secure managed hosting with daily backups, DDoS protection and 24/7 monitoring by senior engineers. Plans from $9/mo, VPS from $45/mo.",
    eyebrow: "Managed Enterprise Hosting",
    headline: "Hosting that stays up,",
    highlight: "stays fast and stays secure.",
    subheadline:
      "Business-critical hosting managed by senior engineers: 24/7 monitoring, automated daily backups and DDoS protection, from a $9/mo site to dedicated servers and custom cloud.",
    bullets: [
      "99.99% uptime guarantee",
      "Automated daily backups & free SSL",
      "DDoS protection & global CDN",
      "24/7 infrastructure monitoring & support",
    ],
    priceFrom: "Hosting from $9/mo · VPS from $45/mo · Dedicated from $150/mo",
    benefits: [
      { title: "Real people on call", desc: "Managed hosting clients get 24/7 support from the engineers who run the infrastructure, not a ticket queue." },
      { title: "Room to grow", desc: "Start small and move to VPS, dedicated or multi-region cloud as you grow, without rebuilding." },
      { title: "Migration handled", desc: "Moving from another host? Tell us where you are now and we'll plan the move with you." },
    ],
    faq: [
      { q: "Can you move my existing website?", a: "Yes. Tell us where it's hosted now and we'll include the migration in your quote." },
      { q: "What's the difference between the plans?", a: "Basic hosting suits small sites, Performance VPS gives you dedicated resources and root access, Dedicated Server gives you private hardware, and Custom Cloud covers multi-region and Kubernetes setups." },
      ...commonFaq,
    ],
    image: "/images/server-room.jpg",
    imageAlt: "Server racks in a data center",
  },
  {
    slug: "web-development",
    serviceId: "web-dev",
    metaTitle: "Custom Website & Web App Development",
    metaDescription:
      "Fast, secure websites and web apps built by senior developers. Starter websites from $1,500, business apps from $4,000. Free, fixed-price quote.",
    eyebrow: "Web Development · Columbus, Ohio",
    headline: "A website that wins you customers,",
    highlight: "built to last.",
    subheadline:
      "Senior developers build fast, secure, mobile-first websites and web apps with clear fixed pricing, then host and support them so they keep performing.",
    bullets: [
      "Custom websites & web applications",
      "E-commerce & payment integration",
      "CMS so you can edit your own content",
      "Speed, SEO & conversion built in",
    ],
    priceFrom: "Websites from $1,500 · Web apps from $4,000 · E-commerce from $8,500",
    benefits: [
      { title: "Fixed price, no surprises", desc: "You get a fixed quote for your exact scope before we start. What we quote is what you pay." },
      { title: "Senior developers only", desc: "No hand-off to juniors. The people you meet are the people who build your site." },
      { title: "Launch is not the end", desc: "We can host, maintain and support what we build, so your site stays fast and secure." },
    ],
    faq: [
      { q: "How long does a website take?", a: "It depends on scope. Your proposal includes a clear timeline before any work starts." },
      { q: "Will I be able to update the site myself?", a: "Yes. We can build on a content management system so your team can edit pages without a developer." },
      ...commonFaq,
    ],
    image: "/images/hero-office.jpg",
    imageAlt: "EGO Web Services team collaborating on a project",
  },
  {
    slug: "mobile-app-development",
    serviceId: "mobile",
    metaTitle: "iOS & Android App Development",
    metaDescription:
      "Native and cross-platform iOS & Android apps by senior engineers, from MVP to scale. MVP apps from $6,000. Get a free, fixed-price quote.",
    eyebrow: "Mobile App Development",
    headline: "Turn your app idea into",
    highlight: "a product people use.",
    subheadline:
      "Senior engineers design and build iOS and Android apps, from a lean MVP to a scalable platform, backed by secure cloud infrastructure and ongoing support.",
    bullets: [
      "iOS & Android, native or cross-platform",
      "UI/UX design built for real users",
      "Secure backend & cloud database",
      "App Store submission & maintenance",
    ],
    priceFrom: "MVP apps from $6,000 · Professional apps from $15,000",
    benefits: [
      { title: "Start lean", desc: "Launch an MVP with the essential features first, then grow it based on what your users actually do." },
      { title: "Built for scale", desc: "The backend and infrastructure come from the same team that runs enterprise hosting." },
      { title: "Through the App Store", desc: "We handle submission and stay on for updates and maintenance." },
    ],
    faq: [
      { q: "Should I build native or cross-platform?", a: "Cross-platform gets you on iOS and Android faster and for less; native suits apps that need maximum performance or deep device features. We'll recommend what fits." },
      ...commonFaq,
    ],
    image: "/images/hero-office.jpg",
    imageAlt: "EGO Web Services team collaborating on a project",
  },
  {
    slug: "branding",
    serviceId: "branding",
    metaTitle: "Brand Identity & Logo Design",
    metaDescription:
      "Professional logo, brand identity and UI design that builds trust. Logo design from $950, complete brand from $2,800. Free quote.",
    eyebrow: "Branding & Design",
    headline: "A brand that looks as good",
    highlight: "as the work you do.",
    subheadline:
      "Logo, visual identity and design systems that make your business look established and trustworthy, across your website, social and print.",
    bullets: [
      "Logo & brand identity design",
      "Brand colours, typography & guidelines",
      "Website & UI design",
      "Social & marketing collateral",
    ],
    priceFrom: "Logo design from $950 · Complete brand from $2,800",
    benefits: [
      { title: "Concepts to choose from", desc: "Logo projects include multiple concepts, so you pick a direction rather than settle for one." },
      { title: "Everything you need to use it", desc: "High-res files, colours and a typography guide so your brand stays consistent everywhere." },
      { title: "Design that ships", desc: "The same team can build your website and apps, so the brand carries through." },
    ],
    faq: [...commonFaq],
    image: "/images/consulting.jpg",
    imageAlt: "Designers reviewing brand work",
  },
  {
    slug: "digital-marketing",
    serviceId: "marketing",
    metaTitle: "Digital Marketing, SEO & PPC",
    metaDescription:
      "Data-driven SEO, PPC and social campaigns focused on leads and revenue, not vanity metrics. Plans from $1,200/mo. Free strategy call.",
    eyebrow: "Digital Marketing",
    headline: "Marketing measured in",
    highlight: "leads, not likes.",
    subheadline:
      "SEO, paid ads, content and social campaigns run by a technical team that tracks what turns into revenue, and reports it to you in plain English.",
    bullets: [
      "SEO & technical SEO audits",
      "PPC & paid social management",
      "Content strategy & creation",
      "Conversion optimisation & reporting",
    ],
    priceFrom: "Plans from $1,200/mo · Growth marketing from $3,500/mo",
    benefits: [
      { title: "Tracked to the lead", desc: "We set up conversion tracking first, so every dollar is tied to enquiries and sales." },
      { title: "Technical by default", desc: "Site speed, tracking and landing pages are handled by engineers, not outsourced." },
      { title: "Clear monthly reporting", desc: "You see what was done, what it cost and what it produced." },
    ],
    faq: [...commonFaq],
    image: "/images/consulting.jpg",
    imageAlt: "Marketing team reviewing campaign results",
  },
];

export function getLanding(slug: string) {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
