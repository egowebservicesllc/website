import { Link, useRoute, useLocation } from "wouter";
import { Menu, X, Phone, ChevronDown, ArrowRightLeft, Activity, Globe2, ArrowRight, ExternalLink, Server, Code2, Palette, Megaphone, Calculator } from "lucide-react";
import { BUSINESS, PARTNERS } from "@/lib/site";
import { SERVICE_MENU } from "@/lib/nav";
import { useState, useEffect, useRef } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";

// Desktop: the logo links home, so "Home" only appears in the mobile menu.
// "Services" and "Cloud" are dropdowns; the rest are plain links.
const after = [
  { path: "/pricing", label: "Pricing" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/about", label: "About" },
];
const routes = [{ path: "/", label: "Home" }, ...after];
const CAT_ICONS = [Server, Code2, Palette, Megaphone];

const PROVIDERS = [
  { path: "/google-cloud", label: "Google Cloud", desc: "Consulting, migration, GKE, BigQuery & AI", logo: PARTNERS.googleCloudIcon, partner: PARTNERS.googleCloud },
  { path: "/aws", label: "AWS", desc: "Migration, cost optimization & managed AWS", logo: PARTNERS.awsBadge, partner: PARTNERS.aws },
  { path: "/azure", label: "Microsoft Azure", desc: "Microsoft workloads, licences & managed Azure", logo: PARTNERS.azureBadge, partner: PARTNERS.azure },
];
const SOLUTIONS = [
  { path: "/cloud-migration", label: "Cloud Migration", desc: "Move servers, apps & data with zero surprises", icon: ArrowRightLeft },
  { path: "/managed-cloud", label: "Managed Cloud", desc: "24/7 monitoring, security & cost control", icon: Activity },
  { path: "/cloud-regions", label: "Global Regions", desc: "Data residency & multi-region setups", icon: Globe2 },
];
const CLOUD_PATHS = [...PROVIDERS, ...SOLUTIONS].map((x) => x.path);

function Dropdown({ label, id, active, width, children }: { label: string; id: string; active: boolean; width: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const enter = () => { window.clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = window.setTimeout(() => setOpen(false), 220); };

  // The panel is positioned against the header container (not the button), so wide menus never overflow the screen.
  return (
    <div ref={wrap} onMouseEnter={enter} onMouseLeave={leave} onClickCapture={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={id}
        className={cn("relative inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-2", active || open ? "text-primary" : "text-muted-foreground")}
      >
        {label}
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")} />
        {active && <motion.div layoutId="navbar-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className={cn("absolute left-1/2 -translate-x-1/2 top-full pt-2 max-w-[calc(100vw-2rem)]", width)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServicesMenu() {
  const [location] = useLocation();
  return (
    <Dropdown label="Services" id="services-menu" active={location === "/services"} width="w-[960px]">
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {SERVICE_MENU.map((cat, i) => {
            const Icon = CAT_ICONS[i];
            return (
              <div key={cat.anchor} className="p-5">
                <Link href={`/services#${cat.anchor}`} className="group flex items-center gap-3 px-2 pb-3 mb-1 border-b border-slate-100">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px]" /></span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900 group-hover:text-primary">{cat.label}</span>
                    <span className="block text-[11px] text-slate-500">{cat.short}</span>
                  </span>
                </Link>
                {cat.types.map((t) => (
                  <Link key={t.anchor} href={`/services#${t.anchor}`} className="block rounded-xl px-2 py-2 hover:bg-slate-50 group">
                    <span className="block text-sm font-semibold text-slate-800 group-hover:text-primary">{t.label}</span>
                    <span className="block text-xs text-slate-500">{t.price}</span>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-4 px-7 py-4 bg-slate-50 border-t border-slate-100">
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-primary">
            View all services <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/#estimator" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-1.5 text-sm font-semibold hover:bg-primary/90">
            <Calculator className="w-4 h-4" /> Get a price estimate in 30 seconds
          </Link>
        </div>
      </div>
    </Dropdown>
  );
}

function CloudMenu() {
  const [location] = useLocation();
  return (
    <Dropdown label="Cloud" id="cloud-menu" active={CLOUD_PATHS.includes(location)} width="w-[720px]">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-5">
                  <div className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Cloud providers</div>
                  {PROVIDERS.map((p) => (
                    <Link key={p.path} href={p.path} className={cn("flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-slate-50", location === p.path && "bg-blue-50/70")}>
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5">
                        <img src={p.logo} alt="" className="max-w-full max-h-full object-contain" width={32} height={32} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          {p.label}
                          {p.partner && <span className="rounded-full bg-blue-50 text-primary border border-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Partner</span>}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">{p.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="p-5 bg-slate-50/70 border-l border-slate-100">
                  <div className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Cloud solutions</div>
                  {SOLUTIONS.map((s) => (
                    <Link key={s.path} href={s.path} className={cn("flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-white", location === s.path && "bg-white")}>
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                        <s.icon className="w-5 h-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{s.label}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{s.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 px-8 py-4 bg-primary text-white">
                <span className="text-sm">Not sure which cloud fits? <span className="font-semibold">Get a free consultation.</span></span>
                <div className="flex items-center gap-4 shrink-0">
                  {PARTNERS.googleCloudProfileUrl && (
                    <a href={PARTNERS.googleCloudProfileUrl} target="_blank" rel="noopener" className="hidden xl:inline-flex items-center gap-1 text-xs text-blue-100 hover:text-white">
                      Partner profile <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Link href="/contact?service=consulting" className="inline-flex items-center gap-1.5 rounded-full bg-white text-primary px-4 py-1.5 text-sm font-semibold hover:bg-blue-50">
                    Talk to an expert <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
    </Dropdown>
  );
}

function MobileServices({ onNavigate }: { onNavigate: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(location === "/services");
  return (
    <div className="px-2 py-3 border-b border-border/50">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn("w-full flex items-center justify-between text-sm font-medium", location === "/services" ? "text-primary" : "text-muted-foreground")}>
        Services
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {SERVICE_MENU.map((cat, i) => {
              const Icon = CAT_ICONS[i];
              return (
                <div key={cat.anchor} className="pt-3">
                  <Link href={`/services#${cat.anchor}`} onClick={onNavigate} className="flex items-center gap-2 px-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <Icon className="w-3.5 h-3.5" /> {cat.label}
                  </Link>
                  <div className="grid grid-cols-2 gap-1">
                    {cat.types.map((t) => (
                      <Link key={t.anchor} href={`/services#${t.anchor}`} onClick={onNavigate} className="rounded-xl px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        {t.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <Link href="/services" onClick={onNavigate} className="mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold text-primary">
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileCloud({ onNavigate }: { onNavigate: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(CLOUD_PATHS.includes(location));
  const item = (path: string, label: string, img?: string, Icon?: typeof Activity, partner?: boolean) => (
    <Link key={path} href={path} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-2 py-2.5", location === path ? "text-primary bg-blue-50/70" : "text-slate-700")}>
      <span className="w-8 h-8 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 text-primary">
        {img ? <img src={img} alt="" className="max-w-full max-h-full object-contain" width={24} height={24} /> : Icon ? <Icon className="w-4 h-4" /> : null}
      </span>
      <span className="text-sm font-medium">{label}</span>
      {partner && <span className="ml-auto rounded-full bg-blue-50 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Partner</span>}
    </Link>
  );
  return (
    <div className="px-2 py-3 border-b border-border/50">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn("w-full flex items-center justify-between text-sm font-medium", CLOUD_PATHS.includes(location) ? "text-primary" : "text-muted-foreground")}>
        Cloud
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 px-2">Providers</div>
            {PROVIDERS.map((p) => item(p.path, p.label, p.logo, undefined, p.partner))}
            <div className="pt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 px-2">Solutions</div>
            {SOLUTIONS.map((s) => item(s.path, s.label, undefined, s.icon))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({ path, label, onClick }: { path: string; label: string; onClick?: () => void }) {
  const [isActive] = useRoute(path);
  
  return (
    <Link href={path}>
      <span
        onClick={onClick}
        className={cn(
          "relative cursor-pointer text-sm font-medium transition-colors hover:text-primary py-2",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        {isActive && (
          <motion.div
            layoutId="navbar-active"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </span>
    </Link>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-border py-3 shadow-sm"
          : "bg-background border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-3 cursor-pointer group">
              <motion.span
                className="inline-flex"
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <BrandLogo size={40} />
              </motion.span>
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
                EGO Web Services
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Main">
            <ServicesMenu />
            <CloudMenu />
            {after.map((route) => (
              <NavLink key={route.path} {...route} />
            ))}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <NavLink path="/support" label="Support" />
            </div>
            {BUSINESS.phone && (
              <a href={`tel:${BUSINESS.phone}`} className="hidden xl:flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                {BUSINESS.phoneDisplay || BUSINESS.phone}
              </a>
            )}
            <Button asChild className="font-medium rounded-full px-6 shadow-sm hover:shadow-md transition-all">
              <Link href="/contact">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Get a Free Quote
                </motion.span>
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-primary w-full origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" as const }}
            id="mobile-nav"
            className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg overflow-y-auto max-h-[calc(100vh-4.5rem)]"
          >
            <nav className="flex flex-col p-4 gap-1 container mx-auto" aria-label="Mobile">
              {routes.map((route, i) => (
                <div key={route.path} className="contents">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-2 py-3 border-b border-border/50"
                  >
                    <NavLink 
                      {...route} 
                      onClick={() => setMobileMenuOpen(false)} 
                    />
                  </motion.div>
                  {route.path === "/" && (
                    <>
                      <MobileServices onNavigate={() => setMobileMenuOpen(false)} />
                      <MobileCloud onNavigate={() => setMobileMenuOpen(false)} />
                    </>
                  )}
                </div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: routes.length * 0.05 }}
                className="px-2 py-3 border-b border-border/50"
              >
                <NavLink 
                  path="/support"
                  label="Support"
                  onClick={() => setMobileMenuOpen(false)} 
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (routes.length + 1) * 0.05 }}
                className="pt-2 pb-4"
              >
                <Button asChild
                  className="w-full font-medium h-12 rounded-full" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/contact">
                    Get a Free Quote
                  </Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Free, no-obligation quote. Reply within {BUSINESS.responseTime}.
                </p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}