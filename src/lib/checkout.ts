/**
 * "Buy now" order form: the extra details asked for each fixed-price service,
 * shared by the /checkout page and /api/checkout (which re-validates them).
 * Keep this file free of React and "@/" imports.
 */
import { PACKAGE_SERVICES, type Package, type PackageService } from "./packages.js";

export interface OrderField {
  id: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const ORDER_FIELDS: Record<string, OrderField[]> = {
  hosting: [
    { id: "domain", label: "Domain name for this hosting", placeholder: "yourbusiness.com", required: true },
    { id: "currentHost", label: "Current hosting provider (if moving)", placeholder: "e.g. GoDaddy, Bluehost, none" },
    { id: "siteType", label: "What will you host?", type: "select", options: ["WordPress site", "Online store", "Custom web app", "Static website", "Email / other", "Not sure"] },
  ],
  branding: [
    { id: "brandName", label: "Business / brand name", placeholder: "As it should appear in the logo", required: true },
    { id: "industry", label: "Industry", placeholder: "e.g. travel, gaming, consulting" },
    { id: "brief", label: "What should your brand convey?", type: "textarea", placeholder: "Style, colours you like or dislike, competitors, examples you love…", required: true },
  ],
  consulting: [
    { id: "environment", label: "Where do your systems run today?", type: "select", required: true, options: ["On-premises servers", "Hosting company / VPS", "AWS", "Microsoft Azure", "Google Cloud", "Mixed / not sure"] },
    { id: "workloads", label: "Roughly what needs assessing?", placeholder: "e.g. 10 VMs, 3 databases, 2 web apps" },
    { id: "target", label: "Preferred cloud", type: "select", options: ["Google Cloud", "AWS", "Microsoft Azure", "Not sure, recommend one"] },
  ],
};

/** Fixed-price packages that can be bought directly. */
export function findCheckoutPackage(serviceId?: string | null, packageName?: string | null): { service: PackageService; pkg: Package } | null {
  const service = PACKAGE_SERVICES.find((s) => s.id === serviceId);
  const pkg = service?.packages.find((p) => p.name === packageName);
  return service && pkg?.checkout ? { service, pkg } : null;
}

export const checkoutHref = (serviceId: string, packageName: string) =>
  `/checkout?service=${encodeURIComponent(serviceId)}&package=${encodeURIComponent(packageName)}`;

export const priceLabel = (pkg: Package) =>
  pkg.checkout ? `${pkg.price}${pkg.checkout.mode === "subscription" ? "/month" : ""}` : pkg.price;
