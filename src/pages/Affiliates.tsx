import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BadgeDollarSign, CheckCircle2, Download, Link2, Loader2, Repeat, Send, ShieldCheck, Users, Wallet } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { BUSINESS } from "@/lib/site";
import { attributionSummary } from "@/lib/ads";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import {
  COMMISSIONS, COOKIE_DAYS, LEVELS, MIN_PAYOUT, RULES, commissionFor, levelFor, money, pricedPackages, rateText,
  type CommissionRule,
} from "@/lib/affiliates";

const field = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
const label = "block text-sm font-medium text-slate-900 mb-1.5";

function exampleFor(rule: CommissionRule) {
  const pk = pricedPackages(rule.serviceId);
  const mid = pk.find((p) => p.price) && pk[Math.min(1, pk.length - 1)];
  if (!mid) return "";
  const per = rule.type === "recurring" ? `${money(mid.price)}/mo` : money(mid.price);
  return `${mid.name} (${per}) earns you ${money(commissionFor(rule, mid.price))}`;
}

/* ---------------- Earnings calculator ---------------- */

function Calculator() {
  const [serviceId, setServiceId] = useState(COMMISSIONS[0].serviceId);
  const rule = COMMISSIONS.find((c) => c.serviceId === serviceId)!;
  const pkgs = pricedPackages(serviceId);
  const [pkgIdx, setPkgIdx] = useState(0);
  const [clients, setClients] = useState(6);
  const pkg = pkgs[Math.min(pkgIdx, pkgs.length - 1)];
  // Each new client is paid at the level reached by the clients before it.
  let total = 0;
  for (let n = 0; n < clients && pkg; n++) total += commissionFor(rule, pkg.price, levelFor(n));
  const level = levelFor(clients);
  const firstClient = pkg ? commissionFor(rule, pkg.price) : 0;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-1">Estimate your earnings</h3>
      <p className="text-slate-600 mb-6">Based on our starting prices. Bigger projects pay more.</p>
      <div className="grid gap-4">
        <div>
          <label className={label} htmlFor="calc-service">Service you'd refer</label>
          <select id="calc-service" className={field} value={serviceId} onChange={(e) => { setServiceId(e.target.value); setPkgIdx(0); }}>
            {COMMISSIONS.map((c) => <option key={c.serviceId} value={c.serviceId}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="calc-package">Package</label>
          <select id="calc-package" className={field} value={pkgIdx} onChange={(e) => setPkgIdx(Number(e.target.value))}>
            {pkgs.map((p, i) => <option key={p.name} value={i}>{p.name}: {money(p.price)}{p.billing.startsWith("/") ? p.billing : ""}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="calc-clients">Paying clients you refer in a year: <span className="text-primary font-bold">{clients}</span></label>
          <input id="calc-clients" type="range" min={1} max={24} value={clients} onChange={(e) => setClients(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-primary text-white p-6">
        <p className="text-blue-100 text-sm font-medium">Estimated yearly commission</p>
        <p className="text-4xl md:text-5xl font-extrabold tracking-tight mt-1">{money(total)}</p>
        <p className="text-blue-100 text-sm mt-3">
          {money(firstClient)} for your first client ({rateText(rule)}). You'd reach the {level.name} level{level.bonus ? `, +${level.bonus}% on later clients` : ""}.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Application form ---------------- */

function ApplyForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [code, setCode] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    if (v("company_website")) return setState("done");
    setState("sending");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v("name"),
          email: v("email"),
          company: v("company") || undefined,
          message: `Affiliate program application.\nWebsite / profile: ${v("site")}\nAudience: ${v("audience")}\nServices to promote: ${f.getAll("services").join(", ") || "not chosen"}\nHow they'll promote: ${v("how")}`,
          services: ["Affiliate program"],
          package: "Affiliate application",
          page: window.location.pathname,
          source: attributionSummary() || undefined,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json().catch(() => ({}));
      if (typeof data.code === "string") setCode(data.code);
      track("affiliate_application", {});
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-3xl bg-green-50 border border-green-200 p-8 text-center" role="status">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <p className="text-xl font-bold text-slate-900">Welcome to the EGO Partner Program!</p>
        {code && (
          <p className="mt-4 text-slate-700">Your referral code: <span className="font-mono font-bold text-slate-900 bg-white border border-green-200 rounded-lg px-2 py-1">{code}</span></p>
        )}
        <p className="mt-4 text-slate-700">We've emailed your welcome pack from affiliates@egowebservices.com: your links, a one-click sign-in to your dashboard, the commission plan and the quick guide. Check your spam folder if it isn't there in a few minutes.</p>
        <Link href="/affiliates/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-white font-semibold px-6 h-12 hover:bg-primary/90">Go to the partner dashboard <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor="af-name">Full name</label>
        <input id="af-name" name="name" required autoComplete="name" className={field} placeholder="Jane Smith" />
      </div>
      <div>
        <label className={label} htmlFor="af-email">Email</label>
        <input id="af-email" name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
      </div>
      <div>
        <label className={label} htmlFor="af-company">Company <span className="text-slate-500 font-normal">(optional)</span></label>
        <input id="af-company" name="company" className={field} placeholder="Your agency or business" />
      </div>
      <div>
        <label className={label} htmlFor="af-site">Website or main profile</label>
        <input id="af-site" name="site" required className={field} placeholder="linkedin.com/in/you or yoursite.com" />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="af-audience">Who is your audience?</label>
        <select id="af-audience" name="audience" required defaultValue="" className={field}>
          <option value="" disabled>Choose…</option>
          {["Business owners and startups", "IT and engineering teams", "Agency or freelancer clients", "Online community, blog or YouTube", "Other"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className={label}>Services you'd promote</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMISSIONS.map((c) => (
            <label key={c.serviceId} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-blue-50">
              <input type="checkbox" name="services" value={c.label} className="accent-[hsl(var(--primary))]" /> {c.short}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="af-how">How will you promote us?</label>
        <textarea id="af-how" name="how" required rows={3} maxLength={800} className={cn(field, "h-auto py-3")} placeholder="e.g. I recommend tech partners to my consulting clients, or I run a newsletter for founders" />
      </div>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="w-full min-h-[52px] rounded-full bg-primary text-white font-semibold text-lg inline-flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70">
          {state === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Apply to become a partner
        </button>
        {state === "error" && <p className="mt-3 text-sm text-red-600" role="alert">Something went wrong. Please email us at <a className="underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p>}
        <p className="mt-3 text-xs text-slate-500">Free to join and approved instantly. By applying you agree to the <a href="/api/partner-kit?doc=plan" target="_blank" rel="noopener" className="underline">program terms</a>.</p>
      </div>
    </form>
  );
}

/* ---------------- Page ---------------- */

export default function Affiliates() {
  const topRate = useMemo(() => Math.max(...COMMISSIONS.map((c) => c.rate)), []);
  return (
    <Layout>
      <Seo path="/affiliates" />

      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-16 md:pt-24 md:pb-20 border-b border-slate-200">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 border border-blue-200">
              <BadgeDollarSign className="w-4 h-4" /> EGO Partner Program
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 text-balance">
              Refer clients. Earn up to {topRate + LEVELS[2].bonus}% commission.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Recommend our cloud, hosting, web, app, branding and marketing services to the people you know. When they become a client, you get paid, including recurring commission on hosting and marketing.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#apply" className="inline-flex items-center gap-2 rounded-full bg-primary text-white font-semibold px-7 h-12 hover:bg-primary/90">Apply now <ArrowRight className="w-4 h-4" /></a>
              <a href="#commissions" className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-300 text-slate-900 font-semibold px-7 h-12 hover:bg-slate-100">See commissions</a>
            </div>
            <ul className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { i: Repeat, t: "Recurring commission on hosting & marketing" },
                { i: Link2, t: `${COOKIE_DAYS}-day referral tracking` },
                { i: Wallet, t: `Monthly payouts from ${money(MIN_PAYOUT)}` },
              ].map(({ i: I, t }) => (
                <li key={t} className="flex items-start gap-2 text-slate-700"><I className="w-5 h-5 text-primary shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <Calculator />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 text-center">How it works</h2>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              { t: "Apply", d: "Tell us how you'd promote us. You're approved instantly and get your welcome pack by email." },
              { t: "Share your links", d: "Get links for any page on our site from your partner dashboard." },
              { t: "We do the selling", d: "Our team quotes, delivers and supports the client. You stay in the loop." },
              { t: "Get paid", d: "Commission is approved once the client pays, then paid out monthly." },
            ].map((s, i) => (
              <li key={s.t} className="rounded-3xl border border-slate-200 p-6 bg-white">
                <span className="w-10 h-10 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center mb-4">{i + 1}</span>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.t}</h3>
                <p className="text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Commission table */}
      <section id="commissions" className="py-16 md:py-24 bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Commission by service</h2>
            <p className="text-lg text-slate-600">Every partner starts on the full rate. Refer more paying clients in a year and your rate goes up on every service.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-5 font-semibold">Service</th>
                  {LEVELS.map((l) => (
                    <th key={l.id} className="p-5 font-semibold">
                      <span className="text-slate-900">{l.name}</span>
                      <span className="block font-normal text-slate-500">{l.minClients ? `${l.minClients}+ paid clients / year` : "From day one"}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS.map((c) => (
                  <tr key={c.serviceId} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="p-5">
                      <p className="font-semibold text-slate-900">{c.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{exampleFor(c)}</p>
                    </td>
                    {LEVELS.map((l) => (
                      <td key={l.id} className="p-5">
                        <span className={cn("text-2xl font-extrabold", l.id === "partner" ? "text-slate-900" : "text-primary")}>{c.rate + l.bonus}%</span>
                        <span className="block text-sm text-slate-600">{c.type === "recurring" ? `monthly, for ${c.months} months` : "of the project"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {LEVELS.map((l) => (
              <div key={l.id} className={cn("rounded-3xl p-6 border", l.id === "elite" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200")}>
                <p className={cn("text-sm font-semibold uppercase tracking-widest", l.id === "elite" ? "text-blue-200" : "text-primary")}>{l.name}</p>
                <p className={cn("text-lg font-bold mt-1 mb-4", l.id === "elite" ? "text-white" : "text-slate-900")}>{l.minClients ? `${l.minClients}+ paid clients in 12 months` : "Everyone starts here"}</p>
                <ul className="space-y-2">
                  {l.perks.map((p) => (
                    <li key={p} className={cn("flex gap-2", l.id === "elite" ? "text-slate-200" : "text-slate-700")}><CheckCircle2 className={cn("w-5 h-5 shrink-0", l.id === "elite" ? "text-blue-300" : "text-primary")} />{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for + rules */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3"><Users className="w-8 h-8 text-primary" /> Great fit for</h2>
            <ul className="space-y-4">
              {[
                ["Freelancers and agencies", "Pass on the cloud, app or hosting work you don't do yourself."],
                ["IT consultants and engineers", "Recommend a Google Cloud Partner your clients can trust."],
                ["Business advisors and accountants", "Your clients ask who can build their website or cut their cloud bill."],
                ["Creators and communities", "Tech, startup and founder audiences on LinkedIn, YouTube or newsletters."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-2xl border border-slate-200 p-5">
                  <p className="font-semibold text-slate-900">{t}</p>
                  <p className="text-slate-600">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-primary" /> Program rules</h2>
            <ul className="space-y-3">
              {RULES.map((r) => (
                <li key={r} className="flex gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{r}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/api/partner-kit?doc=plan" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 h-11 font-semibold text-slate-900 hover:bg-slate-50"><Download className="w-4 h-4" /> Commission plan & terms (PDF)</a>
              <Link href="/affiliates/dashboard" className="inline-flex items-center gap-2 rounded-full px-5 h-11 font-semibold text-primary hover:bg-blue-50">Partner sign in <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Apply to the partner program</h2>
            <p className="text-lg text-slate-600">Free to join and approved instantly. Your referral links, dashboard sign-in and partner kit arrive by email straight away.</p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 p-6 md:p-8">
            <ApplyForm />
          </div>
        </div>
      </section>
    </Layout>
  );
}
