import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/site";

/**
 * Mobile-only CTA bar that slides in once the visitor scrolls past the hero.
 * On phones the only route to a lead used to be scrolling back to the top
 * or opening the menu. Hidden on /contact (the form is already there).
 */
export function StickyQuoteBar() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const show = visible && location !== "/contact";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.25)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex gap-2">
            {BUSINESS.phone ? (
              <a
                href={`tel:${BUSINESS.phone}`}
                className="h-12 w-12 shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700"
                aria-label={`Call EGO Web Services at ${BUSINESS.phoneDisplay || BUSINESS.phone}`}
              >
                <Phone className="w-5 h-5" />
              </a>
            ) : (
              <Link
                href="/contact#book-a-call"
                className="h-12 w-12 shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700"
                aria-label="Book a call"
              >
                <CalendarDays className="w-5 h-5" />
              </Link>
            )}
            <Link
              href="/contact"
              className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
