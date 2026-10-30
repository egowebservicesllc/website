import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, CheckCircle2, FileText, MessageSquareText, Phone, Rocket, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { MailerLiteContactForm, SELECT_PACKAGE_EVENT } from "@/components/MailerLiteContactForm";
import { CalendlyWidget } from "@/components/CalendlyWidget";
import { FaqSection } from "@/components/FaqSection";
import { PlatformLogos } from "@/components/PlatformLogos";
import { googleCloudFeature } from "@/lib/packages";
import { checkoutHref } from "@/lib/checkout";
import { CountUp } from "@/components/ui/count-up";
import { BUSINESS } from "@/lib/site";
import { getLanding } from "@/lib/landing";
import { adsConversion } from "@/lib/ads";
import { cn } from "@/lib/utils";
import { SERVICES as PRICING } from "@/pages/Pricing";
import NotFound from "@/pages/not-found";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function scrollToQuote() {
  const el = document.getElementById("quote");
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
}

/**
 * Distraction-free landing page for paid ads (Google/YouTube, Meta, LinkedIn).
 * No main navigation: one goal (the quote form), one secondary (book a call).
 */
export default function LandingPage({ params }: { params: { slug: string } }) {
  const page = getLanding(params.slug);
  const isGoogleLp = params.slug === "google-cloud";

  useEffect(() => {
    if (page) adsConversion("view_content", { content_name: page.metaTitle, content_category: page.serviceId });
  }, [page]);

  if (!page) return <NotFound />;

  const pricing = PRICING.find((s) => s.id === page.serviceId);
  const packages = pricing?.packages.filter((p) => p.price !== "Custom").slice(0, 3) ?? [];

  const pickPackage = (name: string) => {
    window.dispatchEvent(new CustomEvent(SELECT_PACKAGE_EVENT, { detail: { service: page.serviceId, package: name } }));
    scrollToQuote();
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Seo path={`/lp/${page.slug}`} />

      {/* Minimal header: no menu to leak clicks away from the form */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size={36} />
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">EGO Web Services</span>
          </Link>
          <div className="flex items-center gap-2">
            {BUSINESS.phone && (
              <a href={`tel:${BUSINESS.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary mr-2">
                <Phone className="w-4 h-4" />
                {BUSINESS.phoneDisplay || BUSINESS.phone}
              </a>
            )}
            <Button asChild variant="outline" className="rounded-full hidden sm:inline-flex">
              <a href="#book-a-call">
                <CalendarDays className="w-4 h-4 mr-2" />
                Book a call
              </a>
            </Button>
            <Button className="rounded-full" onClick={scrollToQuote}>
              Free Quote
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-grow">
        {/* Hero + form */}
        <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-50/70 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
              <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:pt-6">
                <motion.span variants={fadeInUp} className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
                  {page.eyebrow}
                </motion.span>
                <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                  {page.headline} <span className="text-primary">{page.highlight}</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
                  {page.subheadline}
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3 mb-8">
                  {page.bullets.map((b) => (
                    <motion.li key={b} variants={fadeInUp} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      <span className="text-slate-700 font-medium">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  {page.priceFrom}
                </motion.div>
              </motion.div>

              <motion.div
                id="quote"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="scroll-mt-20 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Get your free quote</h2>
                <p className="text-slate-600 mb-6 text-sm">
                  A senior engineer replies within {BUSINESS.responseTime}. No obligation.
                </p>
                <MailerLiteContactForm defaultService={page.serviceId} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 md:px-6">
            <PlatformLogos className="mb-10" only={isGoogleLp ? "google" : undefined} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center max-w-5xl mx-auto md:divide-x divide-slate-100">
              {[
                { v: <CountUp end={BUSINESS.projectsDelivered} suffix="+" />, l: "Projects delivered" },
                { v: <CountUp end={BUSINESS.activeClients} suffix="+" />, l: "Active clients" },
                { v: <CountUp end={new Date().getFullYear() - BUSINESS.foundingYear} suffix="+" duration={1.5} />, l: "Years in business" },
                { v: <CountUp end={24} suffix="/7" duration={1.5} />, l: "Support & monitoring" },
              ].map((s) => (
                <div key={s.l} className="px-4">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{s.v}</div>
                  <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12"
            >
              Why businesses choose EGO Web Services
            </motion.h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid md:grid-cols-3 gap-6">
              {page.benefits.map((b) => (
                <motion.div key={b.title} variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <div className="w-12 h-12 bg-white shadow-sm text-primary rounded-2xl flex items-center justify-center mb-5">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Packages */}
        {packages.length > 0 && (
          <section className="py-20 bg-slate-50 border-y border-slate-200">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Transparent starting prices</h2>
                <p className="text-lg text-slate-600">Pick a starting point. Your free quote confirms a fixed price for your exact scope.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={cn(
                      "relative flex flex-col p-8 rounded-3xl bg-white",
                      pkg.recommended ? "border-2 border-primary shadow-xl" : "border border-slate-200 shadow-sm",
                    )}
                  >
                    {pkg.recommended && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Most popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 text-slate-900 mb-6">
                      <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                      <span className="text-slate-500 font-medium">{pkg.billing}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {pkg.features.map((f) => (isGoogleLp ? googleCloudFeature(f) : f)).map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-600 font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                    {pkg.checkout ? (
                      <div className="space-y-2">
                        <Button asChild className="w-full h-12 rounded-xl text-base font-semibold">
                          <Link href={checkoutHref(page.serviceId, pkg.name)}>Buy now</Link>
                        </Button>
                        <button type="button" onClick={() => pickPackage(pkg.name)} className="block w-full text-center text-sm font-semibold text-slate-500 hover:text-primary py-1">
                          or get a quote first
                        </button>
                      </div>
                    ) : (
                    <Button
                      variant={pkg.recommended ? "default" : "outline"}
                      className="w-full h-12 rounded-xl text-base font-semibold"
                      onClick={() => pickPackage(pkg.name)}
                    >
                      Get a quote for this
                    </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">How it works</h2>
            <ol className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MessageSquareText, title: "Tell us what you need", desc: "Fill in the 2-minute form or book a 30-minute call." },
                { icon: FileText, title: "Get a fixed, free quote", desc: `Within ${BUSINESS.responseTime}: scope, timeline and fixed pricing.` },
                { icon: Rocket, title: "We deliver & support", desc: "Senior engineers build, launch and support it 24/7." },
              ].map((step, i) => (
                <li key={step.title} className="relative bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <span className="absolute top-6 right-8 text-5xl font-black text-slate-200/70 select-none" aria-hidden="true">0{i + 1}</span>
                  <div className="w-12 h-12 bg-white shadow-sm text-primary rounded-2xl flex items-center justify-center mb-5">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FaqSection items={page.faq} className="py-20 bg-slate-50 border-t border-slate-200" />

        {/* Book a call */}
        <section id="book-a-call" className="py-20 bg-white border-t border-slate-200 scroll-mt-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Rather talk it through?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Pick a time for a free 30-minute call with a senior engineer.</p>
            </div>
            <CalendlyWidget />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary text-white text-center">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready when you are.</h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10">Get a clear, fixed-price proposal. Free and no obligation.</p>
            <Button
              size="lg"
              variant="secondary"
              onClick={scrollToQuote}
              className="h-14 px-10 text-lg bg-white text-primary hover:bg-slate-100 border-none shadow-lg rounded-full"
            >
              Get My Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="bg-slate-50 border-t border-border py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName} · {BUSINESS.street}, {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}
          </p>
          <nav className="flex gap-4" aria-label="Legal">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/" className="hover:text-primary">Main site</Link>
          </nav>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <a href="#book-a-call" className="h-12 w-12 shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700" aria-label="Book a call">
            <CalendarDays className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={scrollToQuote}
            className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
          >
            Get My Free Quote
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
