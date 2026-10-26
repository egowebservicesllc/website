import { Cloud } from "lucide-react";
import { PARTNERS } from "@/lib/site";
import { cn } from "@/lib/utils";

/** "Google Cloud Partner" pill, with the Google Cloud logo when configured. */
export function GoogleCloudPartnerBadge({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  if (!PARTNERS.googleCloud) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full pl-2 pr-4 py-1.5 text-sm font-semibold border",
        tone === "light" ? "bg-white text-slate-800 border-slate-200 shadow-sm" : "bg-white text-slate-800 border-white/20",
        className,
      )}
    >
      {PARTNERS.googleCloudIcon ? (
        <img src={PARTNERS.googleCloudIcon} alt="" aria-hidden="true" className="h-6 w-auto" />
      ) : (
        <Cloud className="w-4 h-4 text-primary ml-2" aria-hidden="true" />
      )}
      Google Cloud Partner
    </span>
  );
}
