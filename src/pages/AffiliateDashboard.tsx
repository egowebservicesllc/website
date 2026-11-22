import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BarChart3, Check, Copy, Eye, FileText, Link2, Linkedin, Mail, MessageCircle, MousePointerClick, Trophy, Users, Wallet,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  COMMISSIONS, LINK_TARGETS, MIN_PAYOUT, REF_PARAM, levelFor, money, nextLevel, rateText,
} from "@/lib/affiliates";

/* ---------------- Sample data (preview only) ---------------- */
// Replaced by the partner's real data from /api/affiliate once the backend is connected.

type Status = "Lead" | "Quoted" | "Paid" | "Approved" | "Paid out" | "Lost";

const PARTNER = { name: "Sarah Ahmed", code: "sarah", email: "sarah@example.com", payoutMethod: "Wise · USD", joined: "Aug 2026" };

const REFERRALS: { date: string; client: string; service: string; pkg: string; value: number; commission: number; status: Status }[] = [
  { date: "2026-11-18", client: "N***** Logistics", service: "Cloud Consulting & Migration", pkg: "Cloud Migration", value: 7200, commission: 936, status: "Paid" },
  { date: "2026-11-12", client: "B**** Dental", service: "Web Development", pkg: "Starter Website", value: 1500, commission: 225, status: "Quoted" },
  { date: "2026-11-09", client: "Q***** Foods", service: "Managed Hosting", pkg: "Performance VPS", value: 45, commission: 178.2, status: "Paid" },
  { date: "2026-11-02", client: "A*** Studio", service: "Branding & Design", pkg: "Complete Brand", value: 2800, commission: 504, status: "Lead" },
  { date: "2026-10-21", client: "T***** Academy", service: "Digital Marketing", pkg: "Social Starter", value: 1200, commission: 720, status: "Approved" },
  { date: "2026-09-25", client: "M**** Retail", service: "Web Development", pkg: "E-commerce Platform", value: 9100, commission: 1092, status: "Paid out" },
  { date: "2026-09-02", client: "K***** Travel", service: "Mobile App Development", pkg: "MVP App", value: 6000, commission: 600, status: "Lost" },
  { date: "2026-08-20", client: "R**** Health", service: "Cloud Consulting & Migration", pkg: "Cloud Readiness Assessment", value: 2000, commission: 200, status: "Paid out" },
];

const MONTHS = [
  { m: "Jun", clicks: 120, earned: 0 },
  { m: "Jul", clicks: 186, earned: 0 },
  { m: "Aug", clicks: 240, earned: 200 },
  { m: "Sep", clicks: 312, earned: 1092 },
  { m: "Oct", clicks: 368, earned: 720 },
  { m: "Nov", clicks: 412, earned: 1114.2 },
];

const PAYOUTS = [
  { date: "2026-11-01", amount: 1092, method: "Wise", status: "Sent" },
  { date: "2026-10-01", amount: 200, method: "Wise", status: "Sent" },
];

/* ---------------- Helpers ---------------- */

const STATUS_STYLE: Record<Status, string> = {
  Lead: "bg-slate-100 text-slate-700",
  Quoted: "bg-amber-50 text-amber-800",
  Paid: "bg-blue-50 text-blue-800",
  Approved: "bg-green-50 text-green-800",
  "Paid out": "bg-green-600 text-white",
  Lost: "bg-red-50 text-red-700",
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked: the text is still visible to copy by hand */
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
}

function buildLink(path: string, code: string, campaign: string) {
  const u = new URL(path, SITE_URL);
  u.searchParams.set(REF_PARAM, code);
  if (campaign) {
    u.searchParams.set("utm_source", "partner");
    u.searchParams.set("utm_campaign", campaign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40));
  }
  return u.toString();
}

/* ---------------- Sections ---------------- */

function Stat({ icon: I, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <p className="flex items-center gap-2 text-sm text-slate-600"><I className="w-4 h-4 text-primary" />{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function Overview({ stats }: { stats: ReturnType<typeof useStats> }) {
  const maxEarned = Math.max(...MONTHS.map((m) => m.earned), 1);
  const lvl = stats.level;
  const next = nextLevel(lvl);
  const pct = next ? Math.min(100, (stats.paidClients / next.minClients) * 100) : 100;
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={MousePointerClick} label="Link clicks (30 days)" value={String(MONTHS.at(-1)!.clicks)} sub="+12% vs last month" />
        <Stat icon={Users} label="Leads referred" value={String(REFERRALS.length)} sub={`${stats.paidClients} became paying clients`} />
        <Stat icon={Wallet} label="Pending commission" value={money(stats.pending)} sub="Approved after the refund window" />
        <Stat icon={Check} label="Ready to pay out" value={money(stats.approved)} sub={`Paid out so far: ${money(stats.paidOut)}`} />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6"><BarChart3 className="w-5 h-5 text-primary" /> Commission earned by month</h3>
          <div className="flex items-end gap-3 h-48">
            {MONTHS.map((m) => (
              <div key={m.m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-semibold text-slate-700">{m.earned ? money(m.earned) : ""}</span>
                <div className="w-full rounded-t-lg bg-primary/85" style={{ height: `${Math.max(2, (m.earned / maxEarned) * 100)}%` }} />
                <span className="text-xs text-slate-500">{m.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 text-white p-6">
          <h3 className="font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-300" /> Your level: {lvl.name}</h3>
          <p className="text-slate-300 text-sm mt-1">{lvl.bonus ? `+${lvl.bonus}% on every service` : "Full base commission on every service"}</p>
          {next ? (
            <>
              <div className="mt-6 h-3 rounded-full bg-white/15 overflow-hidden"><div className="h-full rounded-full bg-amber-300" style={{ width: `${pct}%` }} /></div>
              <p className="text-sm text-slate-300 mt-3">{stats.paidClients} of {next.minClients} paid clients this year. {next.minClients - stats.paidClients} more to reach <span className="text-white font-semibold">{next.name}</span> (+{next.bonus}%).</p>
            </>
          ) : (
            <p className="text-sm text-slate-300 mt-6">You're on our highest level. Thank you!</p>
          )}
          <ul className="mt-6 space-y-2 text-sm">
            {COMMISSIONS.map((c) => (
              <li key={c.serviceId} className="flex justify-between gap-3 border-b border-white/10 pb-2 last:border-0">
                <span className="text-slate-300">{c.short}</span><span className="font-semibold">{rateText(c, lvl)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ReferralsTable rows={REFERRALS.slice(0, 4)} title="Latest referrals" />
    </div>
  );
}

function LinkBuilder() {
  const [target, setTarget] = useState(LINK_TARGETS[0].path);
  const [campaign, setCampaign] = useState("");
  const { copied, copy } = useCopy();
  const link = buildLink(target, PARTNER.code, campaign);
  const share = encodeURIComponent(link);
  const field = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-1">Create a referral link</h3>
        <p className="text-slate-600 mb-6">Link to any page. Every link carries your code, so referrals are tracked for 90 days.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5" htmlFor="lb-page">Page</label>
            <select id="lb-page" className={field} value={target} onChange={(e) => setTarget(e.target.value)}>
              {LINK_TARGETS.map((t) => <option key={t.path} value={t.path}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5" htmlFor="lb-campaign">Campaign name <span className="text-slate-500 font-normal">(optional)</span></label>
            <input id="lb-campaign" className={field} value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="e.g. LinkedIn post, newsletter" />
          </div>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <code className="flex-1 min-w-0 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 break-all">{link}</code>
          <button onClick={() => copy("link", link)} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold px-5 h-12 hover:bg-primary/90">
            {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "link" ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <a className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-50" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`}><Linkedin className="w-4 h-4" /> LinkedIn</a>
          <a className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-50" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${share}`}><MessageCircle className="w-4 h-4" /> WhatsApp</a>
          <a className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-50" href={`mailto:?subject=${encodeURIComponent("A team I recommend")}&body=${share}`}><Mail className="w-4 h-4" /> Email</a>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-4">Your links by service</h3>
        <ul className="divide-y divide-slate-100">
          {LINK_TARGETS.slice(2, 8).map((t) => {
            const l = buildLink(t.path, PARTNER.code, "");
            return (
              <li key={t.path} className="py-3 flex items-center gap-3">
                <span className="w-40 shrink-0 font-medium text-slate-900 text-sm">{t.label}</span>
                <span className="flex-1 min-w-0 truncate text-sm text-slate-500">{l}</span>
                <button onClick={() => copy(t.path, l)} aria-label={`Copy ${t.label} link`} className="shrink-0 rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                  {copied === t.path ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ReferralsTable({ rows, title }: { rows: typeof REFERRALS; title: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
      <h3 className="font-bold text-slate-900 p-6 pb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="text-left text-slate-600 border-y border-slate-100 bg-slate-50">
            <tr><th className="px-6 py-3 font-semibold">Date</th><th className="px-6 py-3 font-semibold">Client</th><th className="px-6 py-3 font-semibold">Service</th><th className="px-6 py-3 font-semibold">Deal</th><th className="px-6 py-3 font-semibold">Commission</th><th className="px-6 py-3 font-semibold">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date + r.client} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className="px-6 py-3 font-medium text-slate-900">{r.client}</td>
                <td className="px-6 py-3 text-slate-700">{r.service}<span className="block text-slate-500">{r.pkg}</span></td>
                <td className="px-6 py-3 text-slate-700">{r.service.includes("Hosting") || r.service.includes("Marketing") ? `${money(r.value)}/mo` : money(r.value)}</td>
                <td className={cn("px-6 py-3 font-semibold", r.status === "Lost" ? "text-slate-400 line-through" : "text-slate-900")}>{money(r.commission)}</td>
                <td className="px-6 py-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[r.status])}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Payouts({ stats }: { stats: ReturnType<typeof useStats> }) {
  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <p className="text-sm text-slate-600">Ready to pay out</p>
        <p className="text-4xl font-extrabold text-slate-900 mt-1">{money(stats.approved)}</p>
        <p className="text-sm text-slate-500 mt-2">Next payout: Dec 1 · minimum {money(MIN_PAYOUT)}</p>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-600">Pending (refund window)</dt><dd className="font-semibold">{money(stats.pending)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-600">Paid out to date</dt><dd className="font-semibold">{money(stats.paidOut)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-600">Payout method</dt><dd className="font-semibold">{PARTNER.payoutMethod}</dd></div>
        </dl>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <h3 className="font-bold text-slate-900 p-6 pb-4">Payout history</h3>
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {PAYOUTS.map((p) => (
            <li key={p.date} className="px-6 py-4 flex items-center justify-between text-sm">
              <span className="text-slate-700">{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.method}</span>
              <span className="flex items-center gap-3"><span className="font-semibold text-slate-900">{money(p.amount)}</span><span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-800">{p.status}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Resources() {
  const { copied, copy } = useCopy();
  const snippets = COMMISSIONS.map((c) => ({
    key: c.serviceId,
    title: c.label,
    text: `If you need help with ${c.short.toLowerCase() === "apps" ? "a mobile app" : c.label.toLowerCase()}, I recommend EGO Web Services. They're a Google Cloud Partner in business since 2016, they give fixed quotes within one business day, and they've been great to work with. ${buildLink(LINK_TARGETS.find((t) => t.label.toLowerCase().includes(c.short.toLowerCase()))?.path || "/services", PARTNER.code, "")}`,
  }));
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        {snippets.map((s) => (
          <div key={s.key} className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col">
            <p className="font-semibold text-slate-900 mb-2">{s.title}</p>
            <p className="text-sm text-slate-600 flex-1">{s.text}</p>
            <button onClick={() => copy(s.key, s.text)} className="mt-4 self-start inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
              {copied === s.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copied === s.key ? "Copied" : "Copy text"}
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Tips that work</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Introduce clients by email and copy us in. Warm introductions close far more often than links alone.</li>
          <li>Link to the free cloud cost review or free website check: easy first steps that turn into projects.</li>
          <li>Share our solution blueprints and blog articles with your link to show how we work.</li>
        </ul>
      </div>
    </div>
  );
}

function useStats() {
  return useMemo(() => {
    const paidClients = REFERRALS.filter((r) => ["Paid", "Approved", "Paid out"].includes(r.status)).length;
    const sum = (s: Status) => REFERRALS.filter((r) => r.status === s).reduce((a, r) => a + r.commission, 0);
    return { paidClients, level: levelFor(paidClients), pending: sum("Paid"), approved: sum("Approved"), paidOut: sum("Paid out") };
  }, []);
}

/* ---------------- Page ---------------- */

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "links", label: "Referral links", icon: Link2 },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "resources", label: "Resources", icon: FileText },
] as const;

export default function AffiliateDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const stats = useStats();
  return (
    <Layout>
      <Seo path="/affiliates/dashboard" />
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-2.5 flex items-center gap-2"><Eye className="w-4 h-4 shrink-0" /> Preview with sample data. Partners will see their own clicks, referrals and earnings here.</div>
      </div>
      <section className="bg-slate-50 min-h-[70vh] pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Partner dashboard</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Welcome back, {PARTNER.name.split(" ")[0]}</h1>
              <p className="text-slate-600 mt-1">Referral code <span className="font-mono font-semibold text-slate-900">{PARTNER.code}</span> · {stats.level.name} partner since {PARTNER.joined}</p>
            </div>
            <Link href="/affiliates" className="text-primary font-semibold text-sm">Program details and rates</Link>
          </div>

          <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto mb-8 border-b border-slate-200">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cn("inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px", tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-600 hover:text-slate-900")}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <Overview stats={stats} />}
          {tab === "links" && <LinkBuilder />}
          {tab === "referrals" && <ReferralsTable rows={REFERRALS} title="All referrals" />}
          {tab === "payouts" && <Payouts stats={stats} />}
          {tab === "resources" && <Resources />}
        </div>
      </section>
    </Layout>
  );
}

