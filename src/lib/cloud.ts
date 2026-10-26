/**
 * Cloud service pages (indexable, in the sitemap): /google-cloud, /aws,
 * /azure, /cloud-migration, /managed-cloud.
 *
 * Each page targets one keyword cluster so they don't compete with each other:
 *   /google-cloud     → "google cloud partner", "gcp consulting",
 *                        "google cloud migration services", "gke / bigquery consulting"
 *   /aws              → "aws consulting services", "aws migration", "aws cost optimization"
 *   /azure            → "azure consulting", "azure migration", "microsoft azure services"
 *   /cloud-migration  → "cloud migration services", "migrate to the cloud", "data center migration"
 *   /managed-cloud    → "managed cloud services", "cloud cost optimization", "cloud monitoring"
 *
 * PARTNER WORDING: only Google Cloud is described as a partnership. AWS and
 * Azure pages describe services only. When an AWS or Microsoft partnership is
 * confirmed, set the flag in PARTNERS (src/lib/site.ts) and update the copy.
 */
import type { FaqItem } from "@/lib/site";

export type CloudIcon = "cloud" | "migrate" | "container" | "data" | "cost" | "shield" | "monitor" | "server" | "network" | "code";

export interface CloudPageConfig {
  path: string;
  /** Short label used in nav, footer and breadcrumbs. */
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  h1Highlight: string;
  intro: string;
  /** Shown as a highlighted strip under the hero (e.g. partner status). */
  badge?: string;
  /** Long-form section: why this matters, in 2–3 paragraphs (SEO body copy). */
  whyTitle: string;
  why: string[];
  servicesTitle: string;
  services: { icon: CloudIcon; title: string; desc: string }[];
  /** Optional extra highlighted section (e.g. local region, incentives). */
  spotlight?: { title: string; body: string[] };
  outcomes: string[];
  faq: FaqItem[];
  /** Pricing tab + contact form service to link to. */
  pricingTab: string;
  landingSlug: string;
}

export const CLOUD_PAGES: CloudPageConfig[] = [
  {
    path: "/google-cloud",
    navLabel: "Google Cloud",
    metaTitle: "Google Cloud Partner: GCP Consulting, Migration & Managed Services",
    metaDescription:
      "EGO Web Services is a Google Cloud Partner serving businesses worldwide: GCP consulting, migration, GKE, BigQuery, cost optimization and managed Google Cloud by senior engineers.",
    eyebrow: "Google Cloud Partner · Worldwide",
    h1: "Google Cloud consulting & migration",
    h1Highlight: "from a Google Cloud Partner.",
    intro:
      "We help businesses plan, migrate, build and run on Google Cloud: architecture, landing zones, Kubernetes, data and analytics, security and day-to-day operations, delivered by senior engineers in plain English.",
    badge: "EGO Web Services is a Google Cloud Partner",
    whyTitle: "Why Google Cloud, and why work with a partner",
    why: [
      "Google Cloud gives you the same global network and infrastructure that run Google's own products, with strong strengths in data analytics, Kubernetes, AI and security. The challenge for most businesses isn't whether Google Cloud is capable. It's setting it up correctly: projects, networking, identity and billing structured so the platform stays secure and costs stay predictable as you grow.",
      "As a Google Cloud Partner, we design that foundation with you, migrate your workloads in controlled steps and stay on to operate and optimise them. You work directly with senior engineers who explain every decision in business terms, not a sales team followed by a hand-off.",
      "Google Cloud operates regions across the Americas, Europe, the Middle East, Asia-Pacific and Africa. We choose regions close to your customers and your data-residency requirements, and spread critical workloads across regions for resilience, wherever your business operates.",
    ],
    servicesTitle: "Our Google Cloud services",
    services: [
      { icon: "migrate", title: "Google Cloud migration", desc: "Move servers, databases and applications from on-premises or another cloud to Google Cloud with a tested plan, minimal downtime and a rollback path." },
      { icon: "network", title: "Landing zone & architecture", desc: "A secure GCP foundation: resource hierarchy, IAM, VPC networking, billing controls and logging, set up the right way from day one." },
      { icon: "container", title: "GKE & containers", desc: "Containerise applications and run them on Google Kubernetes Engine or Cloud Run with CI/CD, autoscaling and sensible guardrails." },
      { icon: "data", title: "Data & analytics", desc: "Centralise reporting with BigQuery, Cloud SQL and data pipelines so your team gets reliable numbers without managing servers." },
      { icon: "cost", title: "Cost optimisation", desc: "Review your GCP bill, right-size resources, apply committed-use discounts and set budgets and alerts so spending stays under control." },
      { icon: "monitor", title: "Managed Google Cloud", desc: "24/7 monitoring, patching, backups, security reviews and support from the engineers who built your environment." },
    ],
    spotlight: {
      title: "Google Cloud migration incentives",
      body: [
        "Google Cloud runs programs such as the Rapid Migration and Modernization Program (RaMP), which can provide eligible customers with Google Cloud credits and funding toward migration services.",
        "Eligibility and amounts depend on your workloads and Google's program terms. As part of your free consultation we'll check whether your migration could qualify and help you through the application.",
      ],
    },
    outcomes: [
      "A secure, well-structured Google Cloud environment",
      "Workloads migrated with a tested cut-over and rollback plan",
      "Predictable monthly spend with budgets and alerts",
      "Senior engineers on call, 24/7, for managed clients",
    ],
    faq: [
      { q: "Is EGO Web Services a Google Cloud Partner?", a: "Yes. EGO Web Services is a Google Cloud Partner providing Google Cloud consulting, migration and managed services to businesses worldwide." },
      { q: "How long does a migration to Google Cloud take?", a: "It depends on the number and complexity of workloads. A small application can move in weeks; larger estates are migrated in waves. Your free assessment includes a timeline before any work starts." },
      { q: "Can my migration be funded by Google?", a: "Some migrations may qualify for Google Cloud programs such as RaMP, which can include credits and partner services funding. We'll assess eligibility during your consultation. Incentives are subject to Google's approval and terms." },
      { q: "Do you only work with Google Cloud?", a: "No. We're a Google Cloud Partner and we also deliver on AWS and Microsoft Azure, so we can recommend the right platform, or a multi-cloud setup, for each workload." },
      { q: "Can you manage our Google Cloud after migration?", a: "Yes. Our managed cloud service covers monitoring, patching, backups, security reviews, cost optimisation and 24/7 support." },
    ],
    pricingTab: "consulting",
    landingSlug: "google-cloud",
  },
  {
    path: "/cloud-migration",
    navLabel: "Cloud Migration",
    metaTitle: "Cloud Migration Services: Google Cloud, AWS & Azure",
    metaDescription:
      "Plan and migrate servers, apps and databases to Google Cloud, AWS or Azure with minimal downtime. Cloud readiness assessments from $2,000, migrations from $5,500.",
    eyebrow: "Cloud Migration Services",
    h1: "Cloud migration",
    h1Highlight: "without the downtime or surprises.",
    intro:
      "We move your servers, applications and data to Google Cloud, AWS or Microsoft Azure in planned, tested stages, so the business keeps running while your infrastructure moves.",
    whyTitle: "A migration plan before anything moves",
    why: [
      "Most failed cloud migrations fail on planning, not technology: unknown dependencies, surprise costs, and no way back when something breaks. We start every migration with a readiness assessment that maps your applications, data and dependencies, estimates monthly cloud costs, and recommends the right platform for each workload.",
      "From there we build a secure landing zone, migrate in waves, starting with low-risk systems, and test each cut-over with a rollback plan in place. Your team is trained along the way, and we can stay on to manage the environment afterwards.",
    ],
    servicesTitle: "What's included",
    services: [
      { icon: "server", title: "Readiness assessment", desc: "Inventory of servers, apps and data, dependency mapping, cost estimate and a recommended target platform." },
      { icon: "network", title: "Landing zone", desc: "Secure accounts or projects, identity, networking, logging and billing guardrails on your chosen cloud." },
      { icon: "migrate", title: "Workload migration", desc: "Rehost, replatform or refactor each workload, in waves, with testing at every step." },
      { icon: "data", title: "Database & data migration", desc: "Move databases and file storage with validation so nothing is lost or corrupted." },
      { icon: "shield", title: "Security & backup", desc: "Encryption, access controls, backups and disaster-recovery protocols from day one." },
      { icon: "monitor", title: "Training & handover", desc: "Documentation and training for your team, or ongoing managed cloud from us." },
    ],
    outcomes: [
      "A written plan with costs and timeline before any change",
      "Minimal or zero downtime during cut-over",
      "Lower, more predictable infrastructure costs",
      "A team that understands the new environment",
    ],
    faq: [
      { q: "Which cloud should we migrate to?", a: "It depends on your workloads, team skills and budget. We're a Google Cloud Partner and also work on AWS and Azure, so the assessment recommends the best fit rather than one default." },
      { q: "Will there be downtime?", a: "We plan migrations to avoid downtime: replicate, test, then cut over during a low-traffic window with a rollback plan ready." },
      { q: "How much does a cloud migration cost?", a: "Readiness assessments start at $2,000 and migrations from $5,500. You get a fixed quote for your exact scope after the free consultation. Eligible Google Cloud migrations may also qualify for Google incentives." },
    ],
    pricingTab: "consulting",
    landingSlug: "cloud-consulting",
  },
  {
    path: "/managed-cloud",
    navLabel: "Managed Cloud",
    metaTitle: "Managed Cloud Services & Cloud Cost Optimization",
    metaDescription:
      "24/7 managed cloud services for Google Cloud, AWS and Azure: monitoring, patching, backups, security and cost optimization by senior engineers, for businesses worldwide.",
    eyebrow: "Managed Cloud & Cost Optimization",
    h1: "Managed cloud that stays secure,",
    h1Highlight: "fast and on budget.",
    intro:
      "We run your Google Cloud, AWS or Azure environment day to day (monitoring, patching, backups, security and cost control) so your team can focus on the business.",
    whyTitle: "Cloud is easy to start and easy to overspend on",
    why: [
      "Cloud bills grow quietly: idle resources, oversized machines, forgotten test environments and missing discounts. Security drifts the same way as permissions pile up and patches slip. Managed cloud fixes both by putting experienced engineers in charge of keeping your environment healthy every day, not just at launch.",
      "We monitor your infrastructure 24/7, apply updates, verify backups, review access and send you a clear monthly report: what changed, what it costs, and where you can save.",
    ],
    servicesTitle: "What we manage",
    services: [
      { icon: "monitor", title: "24/7 monitoring & alerting", desc: "Uptime, performance and error monitoring with engineers on call for managed clients." },
      { icon: "cost", title: "Cost optimisation", desc: "Right-sizing, scheduling, committed-use and reserved discounts, budgets and anomaly alerts." },
      { icon: "shield", title: "Security & compliance", desc: "Patching, access reviews, encryption and security baseline checks." },
      { icon: "server", title: "Backups & disaster recovery", desc: "Automated, tested backups and a documented recovery plan." },
      { icon: "container", title: "Kubernetes & platform ops", desc: "Cluster upgrades, scaling and CI/CD pipeline support." },
      { icon: "cloud", title: "Multi-cloud", desc: "One team for Google Cloud, AWS and Azure, with one report." },
    ],
    outcomes: [
      "Lower monthly cloud spend",
      "Fewer incidents, faster recovery",
      "Clear monthly reporting in plain English",
      "Engineers who already know your environment",
    ],
    faq: [
      { q: "Which clouds do you manage?", a: "Google Cloud (we're a Google Cloud Partner), AWS and Microsoft Azure, plus our own managed hosting." },
      { q: "Can you reduce our current cloud bill?", a: "Usually, yes. A cost review typically finds idle or oversized resources and missing discounts. We'll show findings before making any change." },
      { q: "Do you offer 24/7 support?", a: "Yes, 24/7 technical support is included for managed clients." },
    ],
    pricingTab: "consulting",
    landingSlug: "cloud-consulting",
  },
  {
    path: "/aws",
    navLabel: "AWS",
    metaTitle: "AWS Consulting, Migration & Cost Optimization",
    metaDescription:
      "AWS consulting services by senior cloud engineers: AWS migration, architecture, cost optimization, security and managed AWS for businesses worldwide.",
    eyebrow: "Amazon Web Services",
    h1: "AWS consulting & migration",
    h1Highlight: "by senior cloud engineers.",
    intro:
      "Whether you're moving to AWS, cleaning up an existing account or trying to bring the bill under control, we design, migrate and run AWS environments that are secure and cost-efficient.",
    whyTitle: "Get more from AWS, and spend less on it",
    why: [
      "AWS offers hundreds of services, which is both its strength and the reason many accounts become hard to manage and expensive. We help you choose the right services, structure accounts and networking properly, and automate the operational work.",
      "For existing AWS customers, we start with an architecture and cost review: security gaps, single points of failure, oversized resources and missing savings plans, with a prioritised list of fixes.",
    ],
    servicesTitle: "Our AWS services",
    services: [
      { icon: "migrate", title: "AWS migration", desc: "Move servers, apps and databases to AWS with a tested, staged plan." },
      { icon: "network", title: "Architecture & landing zone", desc: "Multi-account structure, IAM, VPC networking and logging done right." },
      { icon: "cost", title: "AWS cost optimisation", desc: "Right-sizing, Savings Plans and Reserved Instances, budgets and alerts." },
      { icon: "container", title: "Containers & serverless", desc: "ECS, EKS and Lambda architectures with CI/CD." },
      { icon: "shield", title: "Security review", desc: "IAM, encryption, backups and baseline security checks." },
      { icon: "monitor", title: "Managed AWS", desc: "24/7 monitoring, patching and support for your AWS environment." },
    ],
    outcomes: [
      "A clean, secure AWS account structure",
      "Lower and more predictable AWS bills",
      "Reliable, monitored workloads",
      "Senior engineers who explain every decision",
    ],
    faq: [
      { q: "Can you take over an existing AWS account?", a: "Yes. We start with a review of security, architecture and cost, then agree a plan before making changes." },
      { q: "Should we use AWS or Google Cloud?", a: "Both are excellent. We're a Google Cloud Partner and also deliver on AWS, so we'll recommend the platform that fits your workloads, team and budget." },
      { q: "How much does AWS consulting cost?", a: "Reviews and assessments start at $2,000 and migrations from $5,500, with a fixed quote after a free consultation." },
    ],
    pricingTab: "consulting",
    landingSlug: "cloud-consulting",
  },
  {
    path: "/azure",
    navLabel: "Microsoft Azure",
    metaTitle: "Microsoft Azure Consulting & Migration Services",
    metaDescription:
      "Microsoft Azure consulting, migration and managed services for businesses already using Microsoft 365 and Windows Server. Senior engineers, fixed pricing, free consultation.",
    eyebrow: "Microsoft Azure",
    h1: "Microsoft Azure consulting",
    h1Highlight: "and migration, done properly.",
    intro:
      "If your business runs on Microsoft 365, Windows Server or SQL Server, Azure is often the natural next step. We plan, migrate and manage Azure environments that are secure and cost-efficient.",
    whyTitle: "Azure for Microsoft-centric businesses",
    why: [
      "Azure integrates closely with Microsoft Entra ID (Azure AD), Microsoft 365 and Windows workloads, and existing licences can sometimes be reused to reduce costs. Getting value from it still depends on a solid foundation: subscriptions, identity, networking and governance set up correctly.",
      "We assess your current environment, recommend what to move and how, migrate in stages and stay on to manage and optimise it, alongside Google Cloud or AWS if you run more than one cloud.",
    ],
    servicesTitle: "Our Azure services",
    services: [
      { icon: "migrate", title: "Azure migration", desc: "Move Windows servers, SQL databases and apps to Azure with a staged, tested plan." },
      { icon: "network", title: "Landing zone & identity", desc: "Subscriptions, Entra ID, networking and governance policies." },
      { icon: "cost", title: "Azure cost optimisation", desc: "Right-sizing, reservations and licence reuse where eligible." },
      { icon: "shield", title: "Security & backup", desc: "Access controls, encryption, backup and disaster recovery." },
      { icon: "code", title: "App modernisation", desc: "Move apps to App Service, containers or serverless when it makes sense." },
      { icon: "monitor", title: "Managed Azure", desc: "24/7 monitoring, patching and support." },
    ],
    outcomes: [
      "A well-governed Azure environment",
      "Smooth migration of Microsoft workloads",
      "Controlled, predictable costs",
      "One team across Azure, Google Cloud and AWS",
    ],
    faq: [
      { q: "We use Microsoft 365. Do we need Azure?", a: "Not necessarily. Microsoft 365 runs on its own. Azure is worth considering if you also run servers, databases or apps you'd like to move off on-premises hardware. We'll tell you honestly if it's not worth it." },
      { q: "Do you work with Google Cloud and AWS too?", a: "Yes. We're a Google Cloud Partner and also deliver on AWS, so we can support multi-cloud setups." },
      { q: "How much does an Azure migration cost?", a: "Assessments start at $2,000 and migrations from $5,500, with a fixed quote after a free consultation." },
    ],
    pricingTab: "consulting",
    landingSlug: "cloud-consulting",
  },
  {
    path: "/cloud-regions",
    navLabel: "Global Regions",
    metaTitle: "Global Cloud Regions & Data Residency",
    metaDescription:
      "Deploy on Google Cloud, AWS or Azure regions worldwide. We design multi-region, data-residency-aware cloud architectures for businesses in any country.",
    eyebrow: "Global Cloud · Any Region",
    h1: "Your cloud, in the right region,",
    h1Highlight: "wherever your customers are.",
    intro:
      "Google Cloud, AWS and Microsoft Azure run data centers on every inhabited continent. We help you choose where each workload and dataset should live, for speed, resilience and data-residency rules, then build and run it.",
    whyTitle: "Location matters more than most businesses think",
    why: [
      "Where your cloud runs affects how fast your app feels to customers, what it costs, and whether you meet the data-protection rules of the countries you sell into. The three major clouds operate regions across North and South America, Europe, the Middle East, Africa and Asia-Pacific, but each provider's map, services and prices differ by region.",
      "We map your users, data and compliance requirements, then design an architecture that keeps data where it needs to be, serves customers from nearby regions, and fails over across regions when something goes wrong.",
      "We work remotely with teams in any time zone, with fixed pricing quoted in USD.",
    ],
    servicesTitle: "What we design and run",
    services: [
      { icon: "network", title: "Region & provider selection", desc: "Pick the right provider and regions for latency, services, cost and data residency." },
      { icon: "server", title: "Data residency", desc: "Keep primary data, backups and logs inside the countries or regions you require." },
      { icon: "cloud", title: "Multi-region architecture", desc: "Active-active or failover designs that stay up when a region doesn't." },
      { icon: "migrate", title: "Global migration", desc: "Move workloads between regions or providers in tested stages." },
      { icon: "cost", title: "Cost by region", desc: "Compare regional pricing and egress costs before you commit." },
      { icon: "monitor", title: "24/7 operations", desc: "Monitoring and support across time zones for managed clients." },
    ],
    outcomes: [
      "Faster apps for customers in every market",
      "Data kept where regulations require",
      "Resilience across regions and providers",
      "One team, in any time zone",
    ],
    faq: [
      { q: "Do you work with businesses in my country?", a: "Yes. We work with businesses worldwide, remotely and across time zones." },
      { q: "Can our data stay in our country or region?", a: "In most cases, yes. Google Cloud, AWS and Azure have regions in many countries, and we design your environment so primary data and backups stay where you need them. Specific legal obligations should be confirmed with your advisor." },
      { q: "Which cloud provider has a region near us?", a: "It depends on your location. Each provider publishes its own region map, and we compare them for you during a free consultation, together with service availability and pricing." },
      { q: "What currency are your prices in?", a: "Prices are quoted in US dollars, with a fixed quote after a free consultation." },
    ],
    pricingTab: "consulting",
    landingSlug: "cloud-consulting",
  },
];

export function getCloudPage(path: string) {
  return CLOUD_PAGES.find((p) => p.path === path);
}
