import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { track } from "@/lib/track";

const KEY = "ego_prompt_seen";
const SKIP = ["/contact", "/thank-you", "/privacy", "/terms", "/support", "/checkout", "/portal"];

/**
 * Desktop-only slide-in that offers a free consultation to engaged readers:
 * shown once per visit, after 25 s on the site AND scrolling past 55% of a
 * page (or moving to leave the page). Mobile already has the sticky quote bar.
 * Links to the existing contact page / Calendly; it adds no new form.
 */
export function EngagePrompt() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (SKIP.includes(location) || location.startsWith("/lp/")) return;
    if (window.matchMedia?.("(max-width: 767px)").matches) return;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch {}
    if (seen) return;

    const startedAt = Date.now();
    const show = (reason: string) => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      setOpen(true);
      track("engage_prompt_shown", { reason, page: location });
      cleanup();
    };
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (depth > 0.55 && Date.now() - startedAt > 25000) show("scroll");
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && Date.now() - startedAt > 8000) show("exit_intent");
    };
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return cleanup;
  }, [location]);

  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Free consultation offer"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="hidden md:block fixed left-6 bottom-6 z-50 w-[380px] bg-white rounded-3xl border border-slate-200 shadow-2xl p-6"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <BrandLogo size={40} />
            <div>
              <p className="font-bold text-slate-900 leading-tight">Talk to a senior engineer</p>
              <p className="text-sm text-slate-500">Free 30-minute consultation</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            Planning a cloud move, a new website or an app? Get honest advice and a fixed-price quote, with no obligation.
          </p>
          <div className="flex gap-2">
            <Link
              href="/contact#book-a-call"
              onClick={() => { track("engage_prompt_click", { cta: "book_call" }); close(); }}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-primary text-white font-semibold hover:opacity-90"
            >
              <CalendarDays className="w-4 h-4" /> Book a call
            </Link>
            <Link
              href="/contact"
              onClick={() => { track("engage_prompt_click", { cta: "quote" }); close(); }}
              className="flex-1 inline-flex items-center justify-center h-11 rounded-full border border-slate-200 font-semibold text-slate-800 hover:border-primary hover:text-primary"
            >
              Get a quote
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
