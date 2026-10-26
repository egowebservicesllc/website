import { PARTNERS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Cloud platforms we deliver on" logo strip (logos in /public/badges,
 * paths in PARTNERS in src/lib/site.ts). The "Partner" label is shown only
 * for providers whose partnership flag is true; others appear as platforms
 * we work on, without a partner claim.
 */
const PLATFORMS = [
  { name: "Google Cloud", logo: PARTNERS.googleCloudIcon, partner: PARTNERS.googleCloud, h: "h-10" },
  { name: "Amazon Web Services", logo: PARTNERS.awsBadge, partner: PARTNERS.aws, h: "h-9" },
  { name: "Microsoft Azure", logo: PARTNERS.azureBadge, partner: PARTNERS.azure, h: "h-10" },
];

export function PlatformLogos({ className, label = true }: { className?: string; label?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Cloud platforms we deliver on</p>
      )}
      <ul className="flex flex-wrap items-stretch justify-center gap-3">
        {PLATFORMS.map((p) => (
          <li
            key={p.name}
            className="flex flex-col items-center justify-between gap-2 rounded-2xl bg-white border border-slate-200 shadow-sm px-5 pt-4 pb-3 min-w-[132px]"
          >
            <div className="h-12 flex items-center">
              {p.logo ? (
                <img src={p.logo} alt={p.name} className={cn("w-auto object-contain", p.h)} loading="lazy" decoding="async" />
              ) : (
                <span className="font-semibold text-slate-800">{p.name}</span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              {p.name}
              {p.partner && (
                <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                  Partner
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
