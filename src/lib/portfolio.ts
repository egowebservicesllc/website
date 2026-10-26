/**
 * Real client projects shown on /portfolio, on the homepage "Recent work"
 * strip and in the promo video. Edit freely.
 *
 * Fields:
 *  - url:        live site (shows a "Visit website" link when set)
 *  - category:   one-line description of the client's business
 *  - services:   what EGO Web Services delivered (shown as tags)
 *  - summary:    1–2 sentences on the project
 *  - result:     an outcome you can publish (optional; leave empty if none)
 *  - image:      screenshot in /public/portfolio/ (optional)
 *  - accent:     brand colour used on the card when there's no image
 *
 * Only publish results and quotes you have the client's permission to share.
 */
export interface Project {
  slug: string;
  name: string;
  category: string;
  services: string[];
  summary: string;
  result?: string;
  url?: string;
  image?: string;
  accent: string;
}

export const PROJECTS: Project[] = [
  {
    slug: "traveliaz",
    name: "Traveliaz",
    category: "Travel platform",
    services: ["Design", "Branding", "Marketing"],
    summary:
      "Design, brand identity and marketing for a travel platform for Egypt: recommended hostels for solo travelers, B2B travel services and bookable experiences across Cairo, Alexandria, Hurghada, Sharm El Sheikh, Luxor and Aswan.",
    accent: "#e85d75",
  },
  {
    slug: "raymell-bentley",
    name: "Raymell Bentley",
    category: "Website & brand identity",
    services: ["Website", "Branding"],
    summary: "A complete brand identity and a professional website, designed together so every touchpoint looks consistent.",
    accent: "#ea580c",
  },
  {
    slug: "doomshell-gaming",
    name: "Doomshell Gaming",
    category: "Gaming brand",
    services: ["Branding"],
    summary: "A bold brand identity for a gaming brand, built to stand out with its community and across social channels.",
    accent: "#7c3aed",
  },
  {
    slug: "nadia-subratie-things",
    name: "Nadia Subratie Things",
    category: "Brand identity",
    services: ["Branding"],
    summary: "A distinctive brand identity that gives the business a recognisable, consistent look.",
    accent: "#db2777",
  },
  {
    slug: "marsie-mccann",
    name: "Marsie McCann",
    category: "Website",
    services: ["Website"],
    summary: "A clean, professional website that presents the work clearly and makes it easy to get in touch.",
    accent: "#0d9488",
  },
];

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
