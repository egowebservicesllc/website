import { Link } from "wouter";
import { CheckCircle2, PiggyBank, Gauge, FileCheck2, ArrowRight } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { LeadMagnetForm, type Offer } from "@/components/LeadMagnetForm";
import { PlatformLogos } from "@/components/PlatformLogos";
import { BUSINESS } from "@/lib/site";
import { cn } from "@/lib/utils";

interface OfferPage {
  offer: Offer;
  path: string;
  eyebrow: string;
  h1: string;
  intro: string;
  points: string[];
  how: { t: string; d: string }[];
  formTitle: string;
  icon: typeof PiggyBank;
}

const PAGES: Record<Offer, OfferPage> = {
  "cost-review": {
    offer: "cost-review",
    path: "/free-cloud-cost-review",
    eyebrow: "Free · AWS, Google Cloud & Azure",
    h1: "Find out where you're overpaying for cloud",
    intro:
      "Most cloud bills carry waste: oversized servers, forgotten resources, the wrong storage class and discounts nobody switched on. Send us your bill and a senior engineer will show you where the savings are.",
    points: [
      "Reviewed by a senior cloud engineer, not a tool",
      "Covers compute, storage, databases, Kubernetes and network costs",
      "A short written summary of the biggest savings and the effort involved",
      "Free, with no obligation to work with us",
    ],
    how: [
      { t: "Tell us about your setup", d: "Two minutes: your cloud, rough monthly bill and what runs there." },
      { t: "Share your bill securely", d: "We'll email you the safest way: a PDF invoice or a read-only billing export. We never need passwords." },
      { t: "Get your savings summary", d: `Usually within a few business days of receiving your bill: what to change, what it saves, and how hard it is.` },
    ],
    formTitle: "Request your free cost review",
    icon: PiggyBank,
  },
  "website-check": {
    offer: "website-check",
    path: "/free-website-check",
    eyebrow: "Free · Speed, SEO & mobile",
    h1: "Is your website losing you customers?",
    intro:
      "Slow pages, broken mobile layouts and missing SEO basics quietly cost leads every day. Send us your website and we'll check speed, search visibility and mobile experience, then tell you what to fix first.",
    points: [
      "Page speed and Core Web Vitals on mobile and desktop",
      "SEO basics: titles, indexing, structured data and broken links",
      "Mobile layout, forms and calls to action",
      "Top fixes in priority order, in plain English",
    ],
    how: [
      { t: "Send your website", d: "Your address and what you want more of: leads, sales or rankings." },
      { t: "We run the checks", d: "Automated tests plus a review by a specialist who looks at it like a customer would." },
      { t: "Get your report", d: `By email within ${BUSINESS.responseTime}: the fixes that matter most for your goal.` },
    ],
    formTitle: "Get your free website check",
    icon: Gauge,
  },
  checklist: {
    offer: "checklist",
    path: "/cloud-migration-checklist",
    eyebrow: "Free printable checklist",
    h1: "The cloud migration checklist",
    intro:
      "The 40 checks our engineers run before moving any business to Google Cloud, AWS or Azure: planning, security, data, cut-over and costs. Use it to plan your own move or to check a partner's proposal.",
    points: [
      "Inventory and dependencies: what must move together",
      "Security and access: identities, keys, logging and backups",
      "Data and cut-over: how to move without losing orders or records",
      "Costs: sizing, discounts and budget alerts from day one",
    ],
    how: [
      { t: "Enter your name and email", d: "The checklist opens straight away. Print it or save it as a PDF." },
      { t: "Work through it with your team", d: "Tick off each item; the questions that change cost and risk most are marked." },
      { t: "Want a second opinion?", d: "Reply to our email and a senior cloud engineer will answer, free." },
    ],
    formTitle: "Download the checklist",
    icon: FileCheck2,
  },
};

function OfferLayout({ p }: { p: OfferPage }) {
  const others = (Object.values(PAGES) as OfferPage[]).filter((o) => o.offer !== p.offer);
  return (
    <Layout>
      <Seo path={p.path} />
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-16 md:pt-24 md:pb-24 border-b border-slate-200">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start relative">
          <div>
            <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 border border-blue-200">
              <p.icon className="w-4 h-4" /> {p.eyebrow}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 text-balance">{p.h1}</h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">{p.intro}</p>
            <ul className="space-y-3">
              {p.points.map((x) => (
                <li key={x} className="flex gap-3 text-slate-700 text-lg"><CheckCircle2 className="w-6 h-6 text-primary shrink-0" />{x}</li>
              ))}
            </ul>
            {p.offer === "cost-review" && <div className="mt-10"><PlatformLogos /></div>}
          </div>
          <div id="form" className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{p.formTitle}</h2>
            <LeadMagnetForm offer={p.offer} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">How it works</h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {p.how.map((h, i) => (
              <li key={h.t} className="rounded-3xl border border-slate-200 bg-white p-7">
                <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-4">{i + 1}</span>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{h.t}</h3>
                <p className="text-slate-600">{h.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">More free resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {others.map((o) => (
              <Link key={o.path} href={o.path} className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/40 hover:shadow-md transition-all">
                <o.icon className="w-6 h-6 text-primary mb-3" />
                <span className="block font-semibold text-slate-900 group-hover:text-primary">{o.formTitle}</span>
              </Link>
            ))}
            <Link href="/solutions" className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/40 hover:shadow-md transition-all">
              <ArrowRight className="w-6 h-6 text-primary mb-3" />
              <span className="block font-semibold text-slate-900 group-hover:text-primary">Cloud solution blueprints</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const FreeCostReview = () => <OfferLayout p={PAGES["cost-review"]} />;
export const FreeWebsiteCheck = () => <OfferLayout p={PAGES["website-check"]} />;
export const MigrationChecklist = () => <OfferLayout p={PAGES.checklist} />;

/** Strip of the three free offers, for the homepage and other pages. */
export function FreeOffersStrip({ className }: { className?: string }) {
  const items = Object.values(PAGES) as OfferPage[];
  const title: Record<Offer, string> = {
    "cost-review": "Free cloud cost review",
    "website-check": "Free website check",
    checklist: "Cloud migration checklist",
  };
  const sub: Record<Offer, string> = {
    "cost-review": "A senior engineer shows you where your AWS, Google Cloud or Azure bill can shrink.",
    "website-check": "Speed, SEO and mobile check with the top fixes in priority order.",
    checklist: "The 40-point checklist our engineers use before every cloud move.",
  };
  return (
    <section className={cn("py-16 md:py-20 bg-slate-50 border-y border-slate-200", className)}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Free, no obligation</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Not ready for a quote? Start here.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((o) => (
            <Link key={o.path} href={o.path} className="group flex flex-col rounded-3xl bg-white border border-slate-200 p-7 hover:shadow-xl hover:border-primary/30 transition-all">
              <span className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-5"><o.icon className="w-6 h-6" /></span>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary">{title[o.offer]}</h3>
              <p className="text-slate-600 mb-5">{sub[o.offer]}</p>
              <span className="mt-auto inline-flex items-center gap-2 font-semibold text-primary">{o.offer === "checklist" ? "Download free" : "Get it free"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
