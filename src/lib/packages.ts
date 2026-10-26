/**
 * Service packages and prices: the single source for the Pricing page, the
 * project estimator, the cloud/landing pages AND the lead automation in /api.
 * Keep this file free of React and "@/" imports (the /api functions use it).
 *
 * `checkout` marks a fixed-price package: the automation emails the client a
 * Stripe payment link for it straight away. Packages without `checkout`
 * ("start" prices and Custom) go through the AI-draft + approval flow in Slack.
 */
export interface PackageCheckout {
  mode: "payment" | "subscription";
  amountCents: number;
  interval?: "month" | "year";
}
export interface Package {
  name: string;
  price: string;
  billing: string;
  features: string[];
  recommended?: boolean;
  checkout?: PackageCheckout;
}
export interface PackageService {
  id: string;
  title: string;
  description: string;
  packages: Package[];
}

export const PACKAGE_SERVICES: PackageService[] = [
  {
    id: 'consulting',
    title: 'Cloud Consulting & Migration',
    description: 'Google Cloud Partner. Assessments, migrations and managed cloud on Google Cloud, AWS and Microsoft Azure, delivered by senior engineers.',
    packages: [
      { name: 'Cloud Readiness Assessment', price: '$2,000', billing: ' flat', checkout: { mode: 'payment', amountCents: 200000 }, features: ['Infrastructure & Security Review', 'Cost Estimate (GCP / AWS / Azure)', 'Recommended Target Platform', 'Written Migration Roadmap'] },
      { name: 'Cloud Migration', price: '$5,500', billing: ' start', features: ['Secure Landing Zone Setup', 'Staged Workload Migration', 'Backup & Disaster Recovery', 'Staff Training & Handover'], recommended: true },
      { name: 'Managed Cloud & IT', price: '$9,000', billing: ' start', features: ['24/7 Monitoring & Support', 'Cost Optimization (FinOps)', 'Security Hardening', 'CTO-level Advisory'] },
      { name: 'Enterprise & Multi-Cloud', price: 'Custom', billing: '', features: ['Multi-Cloud Architecture', 'Kubernetes (GKE / EKS / AKS)', 'Compliance & Governance', 'Long-term Roadmap'] }
    ]
  },
  {
    id: 'hosting',
    title: 'Enterprise Hosting',
    description: 'High-performance infrastructure including Shared, VPS, Dedicated, and Cloud solutions optimized for your business.',
    packages: [
      { name: 'Basic Hosting', price: '$9', billing: '/mo', checkout: { mode: 'subscription', amountCents: 900, interval: 'month' }, features: ['Optimized for Small Sites', 'Free SSL & Backups', 'One-Click Installer', '10GB SSD Storage'] },
      { name: 'Performance VPS', price: '$45', billing: '/mo', checkout: { mode: 'subscription', amountCents: 4500, interval: 'month' }, features: ['Dedicated Resources', 'Full Root Access', 'Scalable CPU/RAM', '50GB NVMe Storage'], recommended: true },
      { name: 'Dedicated Server', price: '$150', billing: '/mo', checkout: { mode: 'subscription', amountCents: 15000, interval: 'month' }, features: ['Private Hardware', 'Maximum Security', 'Custom Configurable', '1Gbps Network'] },
      { name: 'Custom Cloud', price: 'Custom', billing: '', features: ['Google Cloud, AWS or Azure', 'Multi-region Clusters', 'Elastic Scaling', 'Managed Kubernetes'] }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Custom web applications and sites built with modern frameworks for ultimate reliability and performance.',
    packages: [
      { name: 'Starter Website', price: '$1,500', billing: ' start', features: ['Professional UI/UX', '5 Core Pages', 'Contact Integration', 'Mobile Optimized'] },
      { name: 'Business Application', price: '$4,000', billing: ' start', features: ['Dynamic Web App', 'User Authentication', 'Admin Dashboard', 'Payment Integration'], recommended: true },
      { name: 'E-commerce Platform', price: '$8,500', billing: ' start', features: ['Full Shop System', 'Inventory Sync', 'Advanced Analytics', 'Customer Portals'] },
      { name: 'Custom Enterprise', price: 'Custom', billing: '', features: ['Microservices', 'Legacy Migration', 'API Development', 'High-Load Systems'] }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    description: 'Native and cross-platform mobile solutions for iOS and Android devices, built for long-term scalability.',
    packages: [
      { name: 'MVP App', price: '$6,000', billing: ' start', features: ['Essential Features', 'Single Platform', 'Clean UI', 'Basic Integration'] },
      { name: 'Professional App', price: '$15,000', billing: ' start', features: ['Multi-platform', 'Social Integration', 'Cloud Database', 'Advanced UX'], recommended: true },
      { name: 'Scalable App', price: '$35,000', billing: ' start', features: ['Complex Logic', 'Biometrics / AR', 'Offline Support', 'Admin Dashboard'] },
      { name: 'Custom Ecosystem', price: 'Custom', billing: '', features: ['IoT / Hardware Sync', 'Internal Enterprise Apps', 'Massively Scalable', 'Full Maintenance'] }
    ]
  },
  {
    id: 'branding',
    title: 'Branding & Design',
    description: 'Strategic visual identities that define your brand and establish trust with your market.',
    packages: [
      { name: 'Logo Design', price: '$950', billing: ' flat', checkout: { mode: 'payment', amountCents: 95000 }, features: ['3 Concepts', 'High-res Exports', 'Brand Colors', 'Typography Guide'] },
      { name: 'Complete Brand', price: '$2,800', billing: ' flat', checkout: { mode: 'payment', amountCents: 280000 }, features: ['Full Design System', 'Stationery Kit', 'Social Media Guide', 'Brand Story'], recommended: true },
      { name: 'Comprehensive Strategy', price: '$5,500', billing: ' start', features: ['Market Analysis', 'Voice & Tone', 'Style Library', 'Print Assets'] },
      { name: 'Custom Corporate', price: 'Custom', billing: '', features: ['Global Brand Refresh', 'Packaging Design', 'Motion Branding', 'Full-scale UI Kits'] }
    ]
  },
  {
    id: 'marketing',
    title: 'Digital Marketing',
    description: 'Data-driven SEO, content, and campaign strategies focused on measurable ROI rather than vanity metrics.',
    packages: [
      { name: 'Social Starter', price: '$1,200', billing: '/mo', features: ['3 Platforms', '12 Posts / Mo', 'Basic Community Mgmt', 'Monthly Report'] },
      { name: 'Growth Marketing', price: '$3,500', billing: '/mo', features: ['Social + PPC Mgmt', 'Full SEO Audit', 'Content Creation', 'Keyword Optimization'], recommended: true },
      { name: 'Comprehensive', price: '$7,000', billing: '/mo', features: ['All Channels', 'Video Marketing', 'Influencer Outreach', 'Daily Optimization'] },
      { name: 'Custom Strategy', price: 'Custom', billing: '', features: ['Bespoke Media Buying', 'Reputation Management', 'PR Integration', 'Strategic Growth'] }
    ]
  }
];

export function findPackage(serviceId?: string | null, packageName?: string | null) {
  const service = PACKAGE_SERVICES.find((s) => s.id === serviceId);
  const name = (packageName || "").split(" · ")[0].trim();
  const pkg = service?.packages.find((p) => p.name === name);
  return { service, pkg };
}

export function serviceByLabel(label: string) {
  const l = label.toLowerCase();
  return PACKAGE_SERVICES.find((s) => s.title.toLowerCase() === l || l.startsWith(s.title.toLowerCase().split(" ")[0]));
}

/** Google Cloud-only wording for shared package lines (used on Google Cloud pages). */
const GC_FEATURE: Record<string, string> = {
  "Cost Estimate (GCP / AWS / Azure)": "Google Cloud Cost Estimate",
  "Recommended Target Platform": "Target Google Cloud Architecture",
};
export const googleCloudFeature = (f: string) => GC_FEATURE[f] ?? f;
