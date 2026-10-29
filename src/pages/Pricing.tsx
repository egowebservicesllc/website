import { checkoutHref } from "@/lib/checkout";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Server, Code, Smartphone, PenTool, BarChart, Cloud, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PRICING_FAQ, BUSINESS } from "@/lib/site";
import { FaqSection } from "@/components/FaqSection";
import { ProjectEstimator } from "@/components/ProjectEstimator";
import { cn } from "@/lib/utils";
import { PACKAGE_SERVICES } from "@/lib/packages";

const SERVICE_ICONS: Record<string, typeof Cloud> = {
  consulting: Cloud,
  hosting: Server,
  "web-dev": Code,
  mobile: Smartphone,
  branding: PenTool,
  marketing: BarChart,
};

// Package data lives in src/lib/packages.ts (shared with the lead automation).
export const SERVICES = PACKAGE_SERVICES.map((s) => ({ ...s, icon: SERVICE_ICONS[s.id] ?? Cloud }));

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Pricing() {
  const [activeCategory, setActiveCategory] = useState(SERVICES[0].id);
  const activeService = SERVICES.find(s => s.id === activeCategory) || SERVICES[0];

  // Deep links: /pricing#web-dev opens that tab (used from the Services page).
  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.slice(1);
      if (SERVICES.some((s) => s.id === id)) setActiveCategory(id);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    window.history.replaceState(window.history.state, "", `#${id}`);
  };

  return (
    <Layout>
      <Seo path="/pricing" />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Transparent, scalable pricing.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              Clear tiers for cloud, hosting, web and marketing. Every project starts with a free consultation and a fixed quote.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-6">
              <a href="#estimator" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                Not sure which package? Take the 30-second estimate <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Category Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto" role="tablist" aria-label="Service pricing">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => selectCategory(service.id)}
                role="tab"
                aria-selected={activeCategory === service.id}
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300",
                  activeCategory === service.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                {service.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {/* Active Service Header */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <activeService.icon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{activeService.title}</h2>
                <p className="text-lg text-slate-600">
                  {activeService.description}
                </p>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {activeService.packages.map((pkg, i) => (
                  <motion.div 
                    key={pkg.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative flex flex-col p-8 rounded-3xl transition-all duration-300 bg-white",
                      pkg.recommended 
                        ? "border-2 border-primary shadow-xl md:scale-105 z-10 mt-4 md:mt-0" 
                        : "border border-slate-200 shadow-sm hover:shadow-md"
                    )}
                  >
                    {pkg.recommended && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Recommended
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1 text-slate-900">
                        <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                        <span className="text-slate-500 font-medium">{pkg.billing}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10 flex-grow">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-600 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {pkg.checkout ? (
                      <div className="space-y-2">
                        <Button asChild className="w-full h-12 rounded-xl text-base font-semibold hover:scale-[1.02] transition-transform">
                          <Link href={checkoutHref(activeCategory, pkg.name)}>Buy now</Link>
                        </Button>
                        <Link href={`/contact?service=${activeCategory}&package=${encodeURIComponent(pkg.name)}`} className="block text-center text-sm font-semibold text-slate-500 hover:text-primary py-1">
                          or ask a question first
                        </Link>
                      </div>
                    ) : (
                    <Button 
                      asChild
                      variant={pkg.recommended ? "default" : "outline"}
                      className={cn(
                        "w-full h-12 rounded-xl text-base font-semibold transition-transform",
                        pkg.recommended && "hover:scale-[1.02]",
                      )}
                    >
                      <Link href={`/contact?service=${activeCategory}&package=${encodeURIComponent(pkg.name)}`}>
                        {pkg.price === 'Custom' ? 'Discuss Requirements' : 'Get Started'}
                      </Link>
                    </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              <p className="mt-12 text-center text-slate-500 text-sm max-w-2xl mx-auto">
                Project prices are starting points. After a free consultation you get a fixed quote for your exact scope, usually within {BUSINESS.responseTime}.
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      <ProjectEstimator className="py-24 bg-white border-t border-slate-200" />

      <FaqSection
        items={PRICING_FAQ}
        title="Pricing questions"
        className="py-24 bg-slate-50 border-t border-slate-200"
      />

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Need a custom solution?</h2>
          <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
            Every business is unique. Contact our senior engineers to discuss your specific requirements and receive a tailored proposal.
          </p>
          <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 border-none shadow-lg rounded-full hover:scale-105 transition-transform">
            <Link href="/contact">
              Contact Us Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

    </Layout>
  );
}