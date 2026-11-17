import { Link, useParams } from "wouter";
import { ArrowRight, ArrowDown, CheckCircle2, ShieldCheck, MapPin, Building2, Cloud, Clock, Layers } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/FaqSection";
import { LeadMagnetForm } from "@/components/LeadMagnetForm";
import { SOLUTIONS, findSolution, type Solution } from "@/lib/solutions";
import NotFound from "@/pages/not-found";

const quoteHref = (s: Solution) =>
  `/contact?service=consulting&package=${encodeURIComponent(`Blueprint: ${s.short}`)}`;

/** Card used on /solutions, the portfolio and cloud pages. */
export function SolutionCard({ s }: { s: Solution }) {
  return (
    <Link
      href={`/solutions/${s.slug}`}
      className="group flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
    >
      <div className="relative p-6 pb-5 text-white" style={{ background: `linear-gradient(135deg, ${s.accent} 0%, #0f172a 120%)` }}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/20 px-2.5 py-1">{s.cloud}</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{s.region}</span>
        </div>
        <MiniDiagram s={s} />
      </div>
      <div className="flex flex-col flex-1 p-6 gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{s.industry}</span>
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{s.title}</h3>
        <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3">{s.summary}</p>
        <span className="mt-auto pt-3 inline-flex items-center gap-2 font-semibold text-primary text-sm">
          See the blueprint <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

/** Small stacked-layers picture for cards. */
function MiniDiagram({ s }: { s: Solution }) {
  return (
    <div className="mt-5 space-y-1.5" aria-hidden="true">
      {s.tiers.slice(1, 4).map((t, i) => (
        <div key={t.name} className="flex gap-1.5" style={{ paddingLeft: i * 10 }}>
          {t.items.slice(0, 3).map((it) => (
            <span key={it} className="truncate rounded-md bg-white/15 border border-white/20 px-2 py-1 text-[11px] font-medium max-w-[45%]">
              {it.split(" (")[0]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full architecture diagram: one row per layer, top (users) to bottom (operations). */
function ArchitectureDiagram({ s }: { s: Solution }) {
  return (
    <figure className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-8" aria-label={`Architecture of ${s.title}`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Layers className="w-4 h-4 text-primary" /> Architecture</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 text-white" style={{ background: s.accent }}>
          <Cloud className="w-3.5 h-3.5" /> {s.cloud} · {s.region}
        </span>
      </div>
      <ol className="space-y-2">
        {s.tiers.map((t, i) => (
          <li key={t.name}>
            <div className="grid md:grid-cols-[170px_1fr] gap-2 md:gap-4 items-center">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.name}</div>
              <div className="flex flex-wrap gap-2">
                {t.items.map((it) => (
                  <span
                    key={it}
                    className="rounded-xl bg-white border px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
                    style={{ borderColor: i === 0 ? "#e2e8f0" : `${s.accent}55` }}
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
            {i < s.tiers.length - 1 && (
              <div className="md:pl-[186px] py-1 text-slate-400" aria-hidden="true">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-5 text-xs text-slate-500">{s.regionNote}</figcaption>
    </figure>
  );
}

/** /solutions */
export function SolutionsIndex() {
  return (
    <Layout>
      <Seo path="/solutions" />
      <section className="bg-slate-50 pt-20 pb-14 md:pt-28 md:pb-20 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <span className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
            Cloud solution blueprints
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 text-balance">
            How we build <span className="text-primary">real cloud platforms</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Proven architectures for e-commerce, fintech, healthcare, SaaS, logistics and streaming, on Google Cloud, AWS and Azure, in the regions
            your customers and regulators need. Each blueprint shows the design, the services, the rollout plan and the timeline.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
              <Link href="/contact?service=consulting">Talk to a cloud architect <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-white">
              <Link href="/free-cloud-cost-review">Free cloud cost review</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => <SolutionCard key={s.slug} s={s} />)}
        </div>
        <p className="container mx-auto px-4 md:px-6 max-w-6xl mt-8 text-sm text-slate-500">
          These are reference designs showing how our engineers build each type of platform. Every project is tailored after a readiness assessment.
        </p>
      </section>

      <ChecklistBand />
    </Layout>
  );
}

function ChecklistBand() {
  return (
    <section className="py-16 md:py-20 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100 mb-3">Free download</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">The cloud migration checklist we use with clients</h2>
          <p className="text-blue-100 text-lg">40 practical checks across planning, security, data, cut-over and costs. A one-page printable checklist (save it as PDF) your team can work through today.</p>
        </div>
        <LeadMagnetForm offer="checklist" compact dark />
      </div>
    </section>
  );
}

function Detail({ s }: { s: Solution }) {
  const others = SOLUTIONS.filter((o) => o.slug !== s.slug).slice(0, 3);
  return (
    <Layout>
      <Seo path={`/solutions/${s.slug}`} />
      {/* Hero */}
      <section className="bg-slate-50 pt-16 pb-14 md:pt-20 md:pb-20 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/solutions" className="hover:text-primary">Cloud solutions</Link>
          </nav>
          <div className="flex flex-wrap gap-2 mb-5 text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-700"><Building2 className="w-4 h-4 text-primary" />{s.industry}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-700"><MapPin className="w-4 h-4 text-primary" />{s.region}</span>
            <Link href={s.cloudPath} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-white" style={{ background: s.accent }}><Cloud className="w-4 h-4" />{s.cloud}</Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight text-balance max-w-4xl">{s.title}</h1>
          <p className="mt-6 text-xl text-slate-600 leading-relaxed max-w-3xl">{s.summary}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
              <Link href={quoteHref(s)}>Get a plan for your platform <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-white">
              <a href="#architecture">See the architecture</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">Solution blueprint: a reference design by our engineers, tailored to each client after a readiness assessment.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-14 md:py-20 space-y-16 md:space-y-20">
        {/* Needs */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">What {s.industry.toLowerCase()} businesses need</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {s.needs.map((n) => (
              <li key={n} className="flex gap-3 rounded-2xl bg-white border border-slate-200 p-4 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{n}
              </li>
            ))}
          </ul>
        </section>

        {/* Architecture */}
        <section id="architecture" className="scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">The architecture</h2>
          <ArchitectureDiagram s={s} />
        </section>

        {/* Stack */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Key services, and why we use them</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {s.stack.map((x) => (
              <div key={x.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-900 mb-1.5">{x.name}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{x.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3"><ShieldCheck className="w-7 h-7 text-blue-300" /> Security & compliance built in</h2>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {s.security.map((x) => (
              <li key={x} className="flex gap-3 text-slate-200"><CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />{x}</li>
            ))}
          </ul>
        </section>

        {/* Rollout */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">How we roll it out</h2>
          <p className="text-slate-600 mb-8 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{s.timeline}</p>
          <ol className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            {s.rollout.map((r, i) => (
              <li key={r.phase} className="pl-8 relative">
                <span className="absolute -left-[15px] top-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-bold text-slate-900 text-lg">{r.phase}</h3>
                  <span className="text-sm font-semibold text-primary">{r.weeks}</span>
                </div>
                <p className="text-slate-600 mt-1">{r.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Outcomes + pricing */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">What you get</h2>
            <ul className="space-y-3">
              {s.outcomes.map((x) => (
                <li key={x} className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">How pricing works</h2>
            <p className="text-slate-700 mb-4">
              Every build starts with our fixed-price <strong>Cloud Readiness Assessment ($2,000)</strong>: inventory, monthly cloud cost estimate,
              final architecture and a fixed quote for the build. Migrations start from $5,500, and we can run the platform for you afterwards as managed cloud.
            </p>
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full h-12 px-6">
                <Link href={quoteHref(s)}>Get a fixed quote <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 px-6 bg-white">
                <Link href="/pricing#consulting">See cloud pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <FaqSection items={s.faq} title="Questions about this blueprint" />

      {/* More */}
      <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">More cloud blueprints</h2>
            <Link href="/solutions" className="text-primary font-semibold inline-flex items-center gap-1.5 shrink-0">All blueprints <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <SolutionCard key={o.slug} s={o} />)}
          </div>
          {s.blog && (
            <p className="mt-8 text-slate-600">Related guide: <Link href={s.blog.href} className="text-primary font-semibold hover:underline">{s.blog.label}</Link></p>
          )}
        </div>
      </section>

      <ChecklistBand />
    </Layout>
  );
}

/** /solutions/:slug */
export function SolutionPage() {
  const params = useParams<{ slug: string }>();
  const s = findSolution(params.slug || "");
  return s ? <Detail s={s} /> : <NotFound />;
}
