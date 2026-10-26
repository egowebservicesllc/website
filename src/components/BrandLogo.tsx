import logoUrl from "@/assets/ego-logo.png";
import { cn } from "@/lib/utils";

/**
 * EGO logo with a brand-blue glow and a light sweep that runs across the
 * logo shape every few seconds (masked to the logo itself, so it never
 * spills outside it). The sweep is disabled for reduced-motion users.
 */
export function BrandLogo({ size = 40, className, glow = true }: { size?: number; className?: string; glow?: boolean }) {
  const mask = { WebkitMaskImage: `url(${logoUrl})`, maskImage: `url(${logoUrl})` } as React.CSSProperties;
  return (
    <span
      className={cn("brand-logo relative inline-block shrink-0", glow && "brand-logo--glow", className)}
      style={{ width: size, height: size }}
    >
      <img src={logoUrl} alt="EGO Web Services Logo" width={size} height={size} className="block w-full h-full" />
      <span aria-hidden="true" className="brand-logo__shine" style={mask}>
        <span className="brand-logo__sweep" />
      </span>
    </span>
  );
}
