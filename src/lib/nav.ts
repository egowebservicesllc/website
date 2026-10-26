/**
 * Service categories and types, shared by the "Services" menu in the navbar
 * and the sections on /services. Each type has its own anchor on /services
 * (e.g. /services#vps-hosting). `serviceId` + `pkg` prefill the contact form;
 * a fixed-price `pkg` also gets the automatic Stripe payment link.
 */
import type { ServiceId } from "@/lib/site";

export interface ServiceType {
  anchor: string;
  label: string;
  desc: string;
  price: string;
  serviceId: ServiceId;
  pkg?: string;
  /** Optional dedicated page instead of the contact form. */
  href?: string;
}

export interface ServiceCategory {
  /** Section id on /services (kept stable for older links). */
  anchor: string;
  label: string;
  short: string;
  types: ServiceType[];
}

export const SERVICE_MENU: ServiceCategory[] = [
  {
    anchor: "enterprise-hosting",
    label: "Hosting",
    short: "Fast, secure and monitored 24/7",
    types: [
      { anchor: "shared-hosting", label: "Shared Hosting", desc: "Affordable, managed hosting for small sites and blogs.", price: "From $9/mo", serviceId: "hosting", pkg: "Basic Hosting" },
      { anchor: "vps-hosting", label: "VPS Hosting", desc: "Dedicated resources and root access for growing apps.", price: "From $45/mo", serviceId: "hosting", pkg: "Performance VPS" },
      { anchor: "dedicated-servers", label: "Dedicated Servers", desc: "Private hardware for maximum performance and security.", price: "From $150/mo", serviceId: "hosting", pkg: "Dedicated Server" },
      { anchor: "cloud-hosting", label: "Cloud Hosting", desc: "Scalable hosting on Google Cloud, AWS or Azure.", price: "Custom quote", serviceId: "hosting", href: "/managed-cloud" },
    ],
  },
  {
    anchor: "development",
    label: "Development",
    short: "Websites, web apps and mobile apps",
    types: [
      { anchor: "web-development", label: "Web Development", desc: "Websites, web applications and e-commerce that convert.", price: "From $1,500", serviceId: "web-dev" },
      { anchor: "mobile-development", label: "App Development", desc: "iOS and Android apps, native or cross-platform.", price: "From $6,000", serviceId: "mobile" },
    ],
  },
  {
    anchor: "branding-design",
    label: "Branding & Design",
    short: "Brands customers remember",
    types: [
      { anchor: "graphic-design", label: "Graphic Design", desc: "Logos, brand identity, UI design and marketing collateral.", price: "Logos from $950", serviceId: "branding" },
      { anchor: "video-animation", label: "Video Animation", desc: "Explainer videos, logo animations and social motion graphics.", price: "Custom quote", serviceId: "branding" },
    ],
  },
  {
    anchor: "digital-marketing",
    label: "Digital Marketing",
    short: "Turn visitors into leads",
    types: [
      { anchor: "social-media-marketing", label: "Social Media", desc: "Content, community management and paid social.", price: "From $1,200/mo", serviceId: "marketing", pkg: "Social Starter" },
      { anchor: "seo", label: "SEO", desc: "Technical SEO, content and rankings that bring leads.", price: "In Growth from $3,500/mo", serviceId: "marketing", pkg: "Growth Marketing" },
      { anchor: "ppc-advertising", label: "PPC Advertising", desc: "Google, Meta and LinkedIn ads managed for ROI.", price: "In Growth from $3,500/mo", serviceId: "marketing", pkg: "Growth Marketing" },
    ],
  },
];

export const typeHref = (t: ServiceType) =>
  t.href ?? `/contact?service=${t.serviceId}${t.pkg ? `&package=${encodeURIComponent(t.pkg)}` : ""}`;
