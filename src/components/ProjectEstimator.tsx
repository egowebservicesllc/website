import { useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES as PRICING } from "@/pages/Pricing";
import { BUSINESS } from "@/lib/site";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * 30-second project estimator. Three taps → a recommended package and
 * starting price → "Get my fixed quote", which opens the existing contact
 * form with the service and package pre-selected (no new form or backend).
 */
const TIMELINES = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-3m", label: "In the next 1–3 months" },
  { id: "exploring", label: "Just exploring options" },
];

export function ProjectEstimator({ className, id = "estimator" }: { className?: string; id?: string }) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);

  const service = PRICING.find((s) => s.id === serviceId);
  const pkg = service?.packages.find((p) => p.name === pkgName);
  const tl = TIMELINES.find((t) => t.id === timeline);

  const pickService = (id: string) => {
    if (step === 0 && !serviceId) track("estimator_start", { service: id });
    setServiceId(id);
    setPkgName(null);
    setStep(1);
  };
  const pickPackage = (name: string) => {
    setPkgName(name);
    setStep(2);
  };
  const pickTimeline = (id: string) => {
    setTimeline(id);
    setStep(3);
    track("estimator_complete", { service: serviceId, package: pkgName, timeline: id });
  };
  const reset = () => {
    setStep(0);
    setServiceId(null);
    setPkgName(null);
    setTimeline(null);
  };

  const quoteHref =
    service && pkg
      ? `/contact?service=${service.id}&package=${encodeURIComponent(`${pkg.name}${tl ? ` · ${tl.label}` : ""}`)}`
      : "/contact";

  const optionClass = (on: boolean) =>
    cn(
      "w-full text-left rounded-2xl border-2 px-5 py-4 transition-all flex items-center gap-4 group",
      on ? "border-primary bg-blue-50/60" : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50",
    );

  return (
    <section id={id} className={cn("py-24 bg-white scroll-mt-24", className)} aria-labelledby={`${id}-title`}>
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-5 tracking-wide uppercase border border-blue-200">
            <Sparkles className="w-4 h-4" /> 30-second estimate
          </span>
          <h2 id={`${id}-title`} className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            What will your project cost?
          </h2>
          <p className="text-lg text-slate-600">Answer three quick questions and see your starting price instantly. No email needed.</p>
        </div>

        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-sm">
          {/* progress */}
          <div className="flex items-center gap-2 mb-8" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: step > i ? "100%" : step === i ? "35%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-slate-900 mb-5">1. What do you need help with?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRICING.map((s) => (
                    <button key={s.id} type="button" onClick={() => pickService(s.id)} className={optionClass(serviceId === s.id)}>
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                        <s.icon className="w-5 h-5" />
                      </span>
                      <span className="font-semibold text-slate-900">{s.title}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && service && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-slate-900 mb-5">2. Which best describes your project?</h3>
                <div className="grid gap-3">
                  {service.packages.map((p) => (
                    <button key={p.name} type="button" onClick={() => pickPackage(p.name)} className={optionClass(pkgName === p.name)}>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-slate-900">{p.name}</span>
                        <span className="block text-sm text-slate-500 truncate">{p.features.slice(0, 3).join(" · ")}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-slate-900 mb-5">3. When would you like to start?</h3>
                <div className="grid gap-3">
                  {TIMELINES.map((t) => (
                    <button key={t.id} type="button" onClick={() => pickTimeline(t.id)} className={optionClass(timeline === t.id)}>
                      <span className="font-semibold text-slate-900">{t.label}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && service && pkg && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Your recommended starting point</p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {service.title}: {pkg.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 text-slate-900 mb-6">
                  {pkg.price === "Custom" ? (
                    <span className="text-4xl font-extrabold">Custom quote</span>
                  ) : (
                    <>
                      <span className="text-sm text-slate-500 font-medium mr-1">from</span>
                      <span className="text-5xl font-extrabold tracking-tight">{pkg.price}</span>
                      <span className="text-slate-500 font-medium">{pkg.billing}</span>
                    </>
                  )}
                </div>
                <ul className="inline-grid sm:grid-cols-2 gap-x-8 gap-y-2 text-left mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full group">
                    <Link href={quoteHref}>
                      Get My Fixed Quote
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-6 text-lg rounded-full bg-white">
                    <Link href="/contact#book-a-call">
                      <CalendarDays className="mr-2 w-5 h-5" /> Talk to an engineer
                    </Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Free and no obligation. Your answers are pre-filled, and a senior engineer replies within {BUSINESS.responseTime}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {step > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep(step === 3 ? 2 : step - 1)}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={reset} className="font-semibold text-slate-500 hover:text-primary">
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
