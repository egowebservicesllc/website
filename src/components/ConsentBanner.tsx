import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { consentRequired, getConsent, setConsent } from "@/lib/ads";

export const OPEN_CONSENT_EVENT = "ego-open-consent";

/**
 * Cookie consent for advertising pixels (Google Ads, Meta, LinkedIn) and GA4.
 * Shown automatically to visitors in Europe until they choose; everyone else
 * can open it from "Cookie preferences" in the footer.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (consentRequired() && getConsent() === null) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  const choose = (state: "granted" | "denied") => {
    setConsent(state);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed z-[60] bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5"
        >
          <p className="font-semibold text-slate-900 mb-1">We value your privacy</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            We use cookies to measure site traffic and the performance of our ads on Google, Meta and LinkedIn. You can accept or decline.{" "}
            <Link href="/privacy" className="text-primary font-medium hover:underline">Privacy policy</Link>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => choose("denied")}>
              Decline
            </Button>
            <Button className="flex-1 rounded-full" onClick={() => choose("granted")}>
              Accept
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
