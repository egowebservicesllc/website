import { Link, useRoute } from "wouter";
import { Menu, X, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";

const routes = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/google-cloud", label: "Google Cloud" },
  { path: "/pricing", label: "Pricing" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/about", label: "About" },
];

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
            {routes.map((route) => (
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
            className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-4 container mx-auto">
              {routes.map((route, i) => (
                <motion.div
                  key={route.path}
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