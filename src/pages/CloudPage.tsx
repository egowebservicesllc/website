import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, ArrowRightLeft, CheckCircle2, Cloud, Code, Container, Database, Gift, MapPin,
  Network, PiggyBank, Server, ShieldCheck, Check, BadgeCheck, ExternalLink, Search, KeyRound,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import { PromoVideo } from "@/components/PromoVideo";
import { BUSINESS, MARKETS, PARTNERS, GOOGLE_CLOUD_CERTIFICATIONS } from "@/lib/site";
import { PlatformLogos } from "@/components/PlatformLogos";
import { CLOUD_PAGES, CLOUD_COMPARE, getCloudPage, type CloudIcon } from "@/lib/cloud";
import { SERVICES as PRICING } from "@/pages/Pricing";
import { cn } from "@/lib/utils";
import { googleCloudFeature } from "@/lib/packages";
import NotFound from "@/pages/not-found";

const ICONS: Record<CloudIcon, typeof Cloud> = {
  cloud: Cloud,
  migrate: ArrowRightLeft,
  container: Container,
  data: Database,
  cost: PiggyBank,
  shield: ShieldCheck,
  monitor: Activity,
  server: Server,
  network: Network,
  code: Code,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

/** Template for the cloud service pages defined in src/lib/cloud.ts. */
export default function CloudPage({ path }: { path: string }) {
  const page = getCloudPage(path);
  if (!page) return <NotFound />;

  const pricing = PRICING.find((s) => s.id === page.pricingTab);
  const quoteHref = `/contact?service=${page.pricingTab}`;
  const isGoogle = page.path === "/google-cloud";
  // The Google Cloud page stays Google Cloud only: no links to the AWS / Azure pages.
  const others = CLOUD_PAGES.filter((p) => p.path !== page.path && !(isGoogle && (p.path === "/aws" || p.path === "/azure")));

  return (
    <Layout>
      <Seo path={page.path} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 pt-20 pb-20 md:pt-28 md:pb-28 border-b border-slate-200">
        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-blue-50/70 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeInUp} className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
              {page.eyebrow}
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              {page.h1} <span className="text-primary">{page.h1Highlight}</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed mb-10 max-w-3xl mx-auto">
              {page.intro}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full group">
                <Link href={quoteHref}>
                  Get a Free Cloud Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white rounded-full">
                <Link href={`/pricing#${page.pricingTab}`}>See Pricing</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-10">
              {isGoogle ? (
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-3xl bg-white border border-slate-200 shadow-sm px-8 py-5">
                  <img src={PARTNERS.googleCloudBadge} alt="Google Cloud" className="h-20 w-auto" width={85} height={80} />
                  <div className="text-center sm:text-left sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-lg font-bold text-slate-900">Google Cloud Partner</div>
                    <div className="text-sm text-slate-600">Partner Advantage program</div>
                    {PARTNERS.googleCloudProfileUrl && (
                      <a href={PARTNERS.googleCloudProfileUrl} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        View our partner profile <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <PlatformLogos />
              )}
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm">
                <MapPin className="w-4 h-4 text-primary" /> Serving {MARKETS.short} · Since {BUSINESS.foundingYear}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why (long-form copy) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{page.whyTitle}</motion.h2>
              {page.why.map((p, i) => (
                <motion.p key={i} variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed mb-5">
                  {p}
                </motion.p>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              {isGoogle ? (
                <PromoVideo
                  src="/videos/ego-google-cloud-16x9.mp4"
                  poster="/videos/ego-google-cloud-16x9-poster.jpg"
                  captions="/videos/ego-google-cloud-16x9.en.vtt"
                  label="EGO Web Services on Google Cloud: migration, modernization, data and AI, managed cloud"
                />
              ) : page.provider ? (
                <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  <div className="flex items-center gap-5 p-8 bg-gradient-to-br from-slate-50 to-blue-50/60 border-b border-slate-200">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-3 shrink-0">
                      <img src={page.provider.logo} alt={page.provider.name} className="max-w-full max-h-full object-contain" width={72} height={72} loading="lazy" />
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-slate-900">{page.provider.name}</div>
                      <div className="text-slate-600">{page.provider.caption}</div>
                    </div>
                  </div>
                  <ul className="p-8 flex flex-wrap gap-2.5">
                    {page.provider.stack.map((t) => (
                      <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                        <Check className="w-3.5 h-3.5 text-primary" /> {t}
                      </li>
                    ))}
                  </ul>
                  <div className="px-8 pb-8 grid grid-cols-3 gap-3 text-center">
                    {[["Senior", "engineers only"], ["Fixed", "price quotes"], ["24/7", "monitoring"]].map(([a, b]) => (
                      <div key={a} className="rounded-2xl bg-blue-50/70 border border-blue-100 py-4">
                        <div className="text-lg font-bold text-primary">{a}</div>
                        <div className="text-xs text-slate-600 font-medium">{b}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-slate-100">
                  <img src="/images/server-room.jpg" alt="Cloud infrastructure in a data center" className="w-full h-full object-cover" width={800} height={600} loading="lazy" decoding="async" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-14">{page.servicesTitle}</h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {page.services.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <motion.div key={s.title} variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Google Cloud certified team */}
      {isGoogle && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-12">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-blue-50 text-primary border border-blue-100 mb-5">
                <BadgeCheck className="w-4 h-4" /> Google Cloud certified
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">A certified Google Cloud team</motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 max-w-3xl mx-auto">
                Your project is led by a Google Cloud certified architect, not handed to a junior. The same people who design your environment build it and support it.
              </motion.p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid md:grid-cols-3 gap-6">
              <motion.div variants={fadeInUp} className="p-8 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col items-start">
                <img src={PARTNERS.googleCloudIcon} alt="Google Cloud" className="h-12 w-auto mb-6" width={57} height={48} loading="lazy" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Google Cloud Partner</h3>
                <p className="text-slate-600 leading-relaxed">An official partner in the Google Cloud Partner Advantage program, serving {MARKETS.long}.</p>
                {PARTNERS.googleCloudProfileUrl && (
                  <a href={PARTNERS.googleCloudProfileUrl} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                    View our partner profile <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
              {GOOGLE_CLOUD_CERTIFICATIONS.map((c) => (
                <motion.div key={c.name} variants={fadeInUp} className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Google Cloud certified</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{c.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Spotlight (e.g. Google incentives) */}
      {page.spotlight && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="rounded-3xl border-2 border-primary/20 bg-blue-50/50 p-8 md:p-12">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                {page.path === "/aws" ? <Search className="w-7 h-7" /> : page.path === "/azure" ? <KeyRound className="w-7 h-7" /> : <Gift className="w-7 h-7" />}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{page.spotlight.title}</h2>
              {page.spotlight.body.map((p, i) => (
                <p key={i} className="text-lg text-slate-700 leading-relaxed mb-4">{p}</p>
              ))}
              {page.spotlight.points && (
                <ul className="grid sm:grid-cols-2 gap-3 my-6">
                  {page.spotlight.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-slate-800 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> {pt}
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild className="rounded-full mt-2">
                <Link href={quoteHref}>{page.spotlight.cta ?? "Check my eligibility"}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Outcomes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10">What you get</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {page.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <span className="text-slate-800 font-medium">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      {pricing && (
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Transparent cloud pricing</h2>
              <p className="text-lg text-slate-600">Starting prices. Your free consultation ends with a fixed quote for your exact scope.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricing.packages.map((pkg) => (
                <div key={pkg.name} className={cn("relative flex flex-col p-8 rounded-3xl bg-white", pkg.recommended ? "border-2 border-primary shadow-xl" : "border border-slate-200 shadow-sm")}>
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
                    {pkg.features.map((f) => (isGoogle ? googleCloudFeature(f) : f)).map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={pkg.recommended ? "default" : "outline"} className="w-full h-12 rounded-xl font-semibold">
                    <Link href={`/contact?service=${page.pricingTab}&package=${encodeURIComponent(pkg.name)}`}>
                      {pkg.price === "Custom" ? "Discuss Requirements" : "Get a Quote"}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Which cloud? (provider pages only) */}
      {!isGoogle && CLOUD_COMPARE.some((c) => c.path === page.path) && (
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Google Cloud, AWS or Azure?</h2>
              <p className="text-lg text-slate-600">We work across all three, so our advice is about what fits your business, not what we resell.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {CLOUD_COMPARE.map((c) => {
                const here = c.path === page.path;
                return (
                  <div key={c.path} className={cn("relative p-8 rounded-3xl bg-white border flex flex-col", here ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-slate-200 shadow-sm")}>
                    {here && <span className="absolute -top-3 left-8 rounded-full bg-primary text-white text-xs font-bold px-3 py-1">You're here</span>}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2">
                        <img src={c.logo} alt="" className="max-w-full max-h-full object-contain" width={44} height={44} loading="lazy" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-900">{c.name}</div>
                        {c.partner && <div className="text-xs font-bold uppercase tracking-wider text-primary">Partner</div>}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Best for</div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {c.bestFor.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-slate-700"><Check className="w-4 h-4 text-primary shrink-0 mt-1" />{b}</li>
                      ))}
                    </ul>
                    {!here && (
                      <Link href={c.path} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        {c.name} services <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-slate-600 mt-10">
              Not sure? <Link href={quoteHref} className="font-semibold text-primary hover:underline">Book a free consultation</Link> and we'll recommend the right platform for your workloads.
            </p>
          </div>
        </section>
      )}

      <FaqSection items={page.faq} className="py-24 bg-white" />

      {/* Related cloud pages (internal links) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">More cloud services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {others.map((o) => (
              <Link key={o.path} href={o.path} className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all">
                <span className="flex items-center justify-between font-semibold text-slate-900 group-hover:text-primary">
                  {o.navLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="block mt-1 text-sm text-slate-500">{o.eyebrow}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Talk to a cloud engineer, free.</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10">
            Tell us where you are today. You'll get a clear recommendation and a fixed-price quote within {BUSINESS.responseTime}.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 text-lg bg-white text-primary hover:bg-slate-100 border-none shadow-lg rounded-full">
              <Link href={quoteHref}>Get a Free Cloud Consultation</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white rounded-full">
              <Link href="/contact#book-a-call">Book a 30-min Call</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
