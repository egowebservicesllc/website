import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BarChart3, Check, Copy, Download, Eye, FileText, Image as ImageIcon, Link2, Linkedin, Loader2, LogOut, Mail, MessageCircle,
  PlayCircle, Trophy, Users, Wallet,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  BANNERS, COMMISSIONS, LEVELS, LINK_TARGETS, MIN_PAYOUT, PARTNER_DOCS, REF_PARAM, REFUND_WINDOW_DAYS, VIDEOS, money, nextLevel, rateText,
  type Level, type PartnerStats, type Referral, type ReferralStatus,
} from "@/lib/affiliates";

interface Me {
  email: string;
  name: string;
  code: string;
  joined: string | null;
  referrals: Referral[];
  stats: PartnerStats;
}

/* ---------------- Demo data (/affiliates/dashboard?demo=1) ---------------- */

const DEMO: Me = {
  email: "sarah@example.com",
  name: "Sarah Ahmed",
  code: "sarah-7f3a",
  joined: "2026-08-01T00:00:00Z",
  referrals: [
    { id: "1", date: "2026-11-18", client: "N***** L******", service: "Cloud Consulting & Migration", pkg: "Cloud Migration", value: 7200, recurring: false, commission: 936, status: "Paid" },
    { id: "2", date: "2026-11-12", client: "B**** D*****", service: "Web Development", pkg: "Starter Website", value: 1500, recurring: false, commission: 225, status: "Quoted" },
    { id: "3", date: "2026-11-09", client: "Q***** F****", service: "Managed Hosting", pkg: "Performance VPS", value: 45, recurring: true, commission: 178.2, status: "Paid" },
    { id: "4", date: "2026-11-02", client: "A*** S*****", service: "Branding & Design", pkg: "Custom Corporate", value: null, recurring: false, commission: null, status: "Lead" },
    { id: "5", date: "2026-10-21", client: "T***** A******", service: "Digital Marketing", pkg: "Social Starter", value: 1200, recurring: true, commission: 720, status: "Approved" },
    { id: "6", date: "2026-09-25", client: "M**** R*****", service: "Web Development", pkg: "E-commerce Platform", value: 9100, recurring: false, commission: 1092, status: "Paid out" },
    { id: "7", date: "2026-09-02", client: "K***** T*****", service: "Mobile App Development", pkg: "MVP App", value: 6000, recurring: false, commission: 600, status: "Lost" },
    { id: "8", date: "2026-08-20", client: "R**** H*****", service: "Cloud Consulting & Migration", pkg: "Cloud Readiness Assessment", value: 2000, recurring: false, commission: 200, status: "Paid out" },
  ],
  stats: { leads: 8, paidClients: 5, level: "pro", pending: 1114.2, approved: 720, paidOut: 1292, potential: 225 },
};

/* ---------------- Helpers ---------------- */

const STATUS_STYLE: Record<ReferralStatus, string> = {
  Lead: "bg-slate-100 text-slate-700",
  Quoted: "bg-amber-50 text-amber-800",
  Paid: "bg-blue-50 text-blue-800",
  Approved: "bg-green-50 text-green-800",
  "Paid out": "bg-green-600 text-white",
  Lost: "bg-red-50 text-red-700",
};

const levelById = (id: Level["id"]) => LEVELS.find((l) => l.id === id) || LEVELS[0];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked: the text is still on screen to copy by hand */
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
}

function buildLink(path: string, code: string, campaign = "") {
  const u = new URL(path, SITE_URL);
  u.searchParams.set(REF_PARAM, code);
  if (campaign) {
    u.searchParams.set("utm_source", "partner");
    u.searchParams.set("utm_campaign", campaign.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40));
  }
  return u.toString();
}

async function api(action: string, init?: RequestInit) {
  const r = await fetch(`/api/affiliate?action=${action}`, { credentials: "same-origin", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

/** Draws an SVG banner onto a canvas and downloads it as a PNG. */
async function downloadPng(file: string, w: number, h: number) {
  const img = new Image();
  img.src = file;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ego-web-services-${w}x${h}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
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

function monthly(referrals: Referral[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, m: d.toLocaleDateString("en-US", { month: "short" }), earned: 0 };
  });
  for (const r of referrals) {
    if (!["Paid", "Approved", "Paid out"].includes(r.status) || !r.commission) continue;
    const d = new Date(r.date);
    const slot = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (slot) slot.earned += r.commission;
  }
  return months;
}

function Overview({ me, goLinks }: { me: Me; goLinks: () => void }) {
  const { stats, referrals } = me;
  const lvl = levelById(stats.level);
  const next = nextLevel(lvl);
  const pct = next ? Math.min(100, (stats.paidClients / next.minClients) * 100) : 100;
  const months = monthly(referrals);
  const maxEarned = Math.max(...months.map((m) => m.earned), 1);
  const { copied, copy } = useCopy();
  const mainLink = buildLink("/", me.code);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Referrals" value={String(stats.leads)} sub={`${stats.paidClients} paying in the last 12 months`} />
        <Stat icon={BarChart3} label="In the pipeline" value={money(stats.potential)} sub="Leads and quotes, if they go ahead" />
        <Stat icon={Wallet} label="Pending commission" value={money(stats.pending)} sub={`Approved after ${REFUND_WINDOW_DAYS} days`} />
        <Stat icon={Check} label="Ready to pay out" value={money(stats.approved)} sub={`Paid out so far: ${money(stats.paidOut)}`} />
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600">Your main referral link</p>
          <p className="font-mono text-sm text-slate-900 break-all">{mainLink}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => copy("main", mainLink)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white font-semibold px-4 h-11 hover:bg-primary/90">
            {copied === "main" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "main" ? "Copied" : "Copy"}
          </button>
          <button onClick={goLinks} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 font-semibold px-4 h-11 hover:bg-slate-50">More links</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6"><BarChart3 className="w-5 h-5 text-primary" /> Commission earned by month</h3>
          <div className="flex items-end gap-3 h-48">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
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
              <p className="text-sm text-slate-300 mt-3">{stats.paidClients} of {next.minClients} paying clients this year. {next.minClients - stats.paidClients} more to reach <span className="text-white font-semibold">{next.name}</span> (+{next.bonus}%).</p>
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

      <ReferralsTable rows={referrals.slice(0, 5)} title="Latest referrals" />
    </div>
  );
}

function LinkBuilder({ code }: { code: string }) {
  const [target, setTarget] = useState(LINK_TARGETS[0].path);
  const [campaign, setCampaign] = useState("");
  const { copied, copy } = useCopy();
  const link = buildLink(target, code, campaign);
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
          {LINK_TARGETS.slice(2).map((t) => {
            const l = buildLink(t.path, code);
            return (
              <li key={t.path} className="py-3 flex items-center gap-3">
                <span className="w-44 shrink-0 font-medium text-slate-900 text-sm">{t.label}</span>
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

function ReferralsTable({ rows, title }: { rows: Referral[]; title: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
      <h3 className="font-bold text-slate-900 p-6 pb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-slate-600">No referrals yet. Share your link and every enquiry that comes through it will appear here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="text-left text-slate-600 border-y border-slate-100 bg-slate-50">
              <tr><th className="px-6 py-3 font-semibold">Date</th><th className="px-6 py-3 font-semibold">Client</th><th className="px-6 py-3 font-semibold">Service</th><th className="px-6 py-3 font-semibold">Deal</th><th className="px-6 py-3 font-semibold">Commission</th><th className="px-6 py-3 font-semibold">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{r.client}</td>
                  <td className="px-6 py-3 text-slate-700">{r.service}<span className="block text-slate-500">{r.pkg}</span></td>
                  <td className="px-6 py-3 text-slate-700">{r.value === null ? "Being quoted" : `${money(r.value)}${r.recurring ? "/mo" : ""}`}</td>
                  <td className={cn("px-6 py-3 font-semibold", r.status === "Lost" ? "text-slate-400 line-through" : "text-slate-900")}>{r.commission === null ? <span className="font-normal text-slate-500">Once priced</span> : money(r.commission)}</td>
                  <td className="px-6 py-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[r.status])}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Payouts({ me }: { me: Me }) {
  const { stats } = me;
  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <p className="text-sm text-slate-600">Ready to pay out</p>
        <p className="text-4xl font-extrabold text-slate-900 mt-1">{money(stats.approved)}</p>
        <p className="text-sm text-slate-500 mt-2">{stats.approved >= MIN_PAYOUT ? "Included in the next monthly payout." : `Paid once your approved balance reaches ${money(MIN_PAYOUT)}.`}</p>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-600">Pending (refund window)</dt><dd className="font-semibold">{money(stats.pending)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-600">Paid out to date</dt><dd className="font-semibold">{money(stats.paidOut)}</dd></div>
        </dl>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-slate-700">
        <h3 className="font-bold text-slate-900 mb-3">How payouts work</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Commission is approved once the client has paid and the {REFUND_WINDOW_DAYS}-day refund window has passed.</li>
          <li>Approved commission is paid in the first week of each month, from {money(MIN_PAYOUT)}, in US dollars.</li>
          <li>We pay by bank transfer, Wise or Stripe. To set or change your payout method, email <a className="text-primary underline" href="mailto:affiliates@egowebservices.com">affiliates@egowebservices.com</a>.</li>
        </ul>
      </div>
    </div>
  );
}

function Resources({ code }: { code: string }) {
  const { copied, copy } = useCopy();
  const [busy, setBusy] = useState<string | null>(null);
  const snippets = COMMISSIONS.map((c) => {
    const target = LINK_TARGETS.find((t) => t.label.toLowerCase().includes(c.short.toLowerCase()))?.path || "/services";
    return {
      key: c.serviceId,
      title: c.label,
      text: `If you need help with ${c.short === "Apps" ? "a mobile app" : c.label.toLowerCase()}, I recommend EGO Web Services. They're a Google Cloud Partner in business since 2016, they give fixed quotes within one business day, and they've been great to work with. (I may earn a referral fee.) ${buildLink(target, code)}`,
    };
  });

  return (
    <div className="grid gap-8">
      <section>
        <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Partner kit</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {PARTNER_DOCS.map((d) => (
            <a key={d.href} href={d.href} target="_blank" rel="noopener" className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-4 hover:border-primary">
              <span className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></span>
              <span><span className="block font-semibold text-slate-900">{d.label} (PDF)</span><span className="text-sm text-slate-600">{d.note}</span></span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Banners</h3>
        <p className="text-slate-600 mb-4">Download a PNG for social media, or copy the embed code for your website. The embed code already includes your link.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {BANNERS.map((b) => {
            const embed = `<a href="${buildLink("/", code, "banner")}" target="_blank" rel="noopener"><img src="${SITE_URL}${b.file}" width="${b.w}" height="${b.h}" alt="EGO Web Services: cloud, hosting, websites and apps" style="max-width:100%;height:auto"></a>`;
            return (
              <div key={b.file} className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col">
                <div className="rounded-xl bg-slate-100 p-3 flex items-center justify-center h-44">
                  <img src={b.file} alt={`${b.label} banner preview`} className="max-h-full max-w-full rounded shadow-sm" loading="lazy" />
                </div>
                <p className="font-semibold text-slate-900 mt-3">{b.label} · {b.w}×{b.h}</p>
                <p className="text-sm text-slate-600 flex-1">{b.use}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={async () => { setBusy(b.file); try { await downloadPng(b.file, b.w, b.h); } finally { setBusy(null); } }} className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2 text-sm font-semibold hover:bg-primary/90">
                    {busy === b.file ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PNG
                  </button>
                  <button onClick={() => copy(b.file, embed)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                    {copied === b.file ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copied === b.file ? "Copied" : "Copy embed code"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-primary" /> Videos</h3>
        <p className="text-slate-600 mb-4">Download and upload the video natively to LinkedIn, YouTube, Facebook or Instagram, then put your link in the caption.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {VIDEOS.map((v) => {
            const caption = `Looking for a reliable cloud, hosting and web partner? I recommend EGO Web Services, a Google Cloud Partner since 2016. (I may earn a referral fee.) ${buildLink(v.path, code, "video")}`;
            return (
              <div key={v.file} className="rounded-2xl bg-white border border-slate-200 p-4">
                <video src={v.file} poster={v.poster} controls preload="none" className="w-full rounded-xl aspect-video bg-slate-900" />
                <p className="font-semibold text-slate-900 mt-3">{v.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={v.file} download className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2 text-sm font-semibold hover:bg-primary/90"><Download className="w-4 h-4" /> Download MP4</a>
                  <button onClick={() => copy(v.file, caption)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                    {copied === v.file ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copied === v.file ? "Copied" : "Copy caption"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-primary" /> Ready-made posts</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {snippets.map((s) => (
            <div key={s.key} className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col">
              <p className="font-semibold text-slate-900 mb-2">{s.title}</p>
              <p className="text-sm text-slate-600 flex-1 break-words">{s.text}</p>
              <button onClick={() => copy(s.key, s.text)} className="mt-4 self-start inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                {copied === s.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copied === s.key ? "Copied" : "Copy text"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-2">Tips that work</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Introduce clients by email and copy affiliates@egowebservices.com. Warm introductions close far more often than links alone.</li>
          <li>Link to the free cloud cost review or free website check: easy first steps that turn into projects.</li>
          <li>Say that you may earn a referral fee. It builds trust and is required in many countries.</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Sign-in ---------------- */

function SignIn({ notice }: { notice?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { status, data } = await api("login", { method: "POST", body: JSON.stringify({ email }) }).catch(() => ({ status: 0, data: {} as { error?: string } }));
    if (status === 200) setState("sent");
    else {
      setError(data.error || "Something went wrong. Please try again.");
      setState("error");
    }
  };
  return (
    <div className="max-w-md mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 p-8">
      <h1 className="text-2xl font-extrabold text-slate-900">Partner dashboard</h1>
      <p className="text-slate-600 mt-2">Sign in with the email you applied with. We'll email you a one-click sign-in link from affiliates@egowebservices.com.</p>
      {notice && <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm p-3">{notice}</p>}
      {state === "sent" ? (
        <p className="mt-6 rounded-xl bg-green-50 border border-green-200 text-green-900 p-4">If {email} is a partner account, a sign-in link is on its way. It works for 20 minutes.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label htmlFor="pd-email" className="text-sm font-medium text-slate-900">Email</label>
          <input id="pd-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button disabled={state === "sending"} className="h-12 rounded-full bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70">
            {state === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />} Email me a sign-in link
          </button>
          {state === "error" && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </form>
      )}
      <p className="mt-6 text-sm text-slate-600">Not a partner yet? <Link href="/affiliates#apply" className="text-primary font-semibold underline">Apply in 2 minutes</Link></p>
    </div>
  );
}

/* ---------------- Page ---------------- */

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "links", label: "Referral links", icon: Link2 },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "resources", label: "Resources", icon: FileText },
] as const;

type View = { kind: "loading" } | { kind: "signedOut"; notice?: string } | { kind: "ready"; me: Me; demo: boolean } | { kind: "error"; message: string };

export default function AffiliateDashboard() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      setView({ kind: "ready", me: DEMO, demo: true });
      return;
    }
    (async () => {
      const token = params.get("token");
      let notice: string | undefined;
      if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        const s = await api("session", { method: "POST", body: JSON.stringify({ token }) }).catch(() => ({ status: 0, data: {} }));
        if (s.status !== 200) notice = (s.data as { error?: string }).error || "That sign-in link has expired. Please request a new one.";
      }
      const { status, data } = await api("me").catch(() => ({ status: 0, data: {} as Record<string, unknown> }));
      if (status === 200) setView({ kind: "ready", me: data as unknown as Me, demo: false });
      else if (status === 401) setView({ kind: "signedOut", notice });
      else setView({ kind: "error", message: (data as { error?: string }).error || "Your dashboard is temporarily unavailable. Please try again shortly." });
    })();
  }, []);

  const signOut = async () => {
    await api("logout", { method: "POST" }).catch(() => null);
    setView({ kind: "signedOut" });
  };

  const me = view.kind === "ready" ? view.me : null;
  const lvl = useMemo(() => (me ? levelById(me.stats.level) : LEVELS[0]), [me]);

  return (
    <Layout>
      <Seo path="/affiliates/dashboard" />
      {view.kind === "ready" && view.demo && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-2.5 flex items-center gap-2"><Eye className="w-4 h-4 shrink-0" /> Demo with sample data. Partners see their own referrals and earnings here.</div>
        </div>
      )}
      <section className="bg-slate-50 min-h-[70vh] pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-10">
          {view.kind === "loading" && <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading your dashboard" /></div>}
          {view.kind === "signedOut" && <SignIn notice={view.notice} />}
          {view.kind === "error" && <p className="max-w-md mx-auto rounded-2xl bg-white border border-slate-200 p-6 text-slate-700">{view.message}</p>}
          {me && (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">Partner dashboard</p>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Welcome back, {me.name.split(" ")[0]}</h1>
                  <p className="text-slate-600 mt-1">Referral code <span className="font-mono font-semibold text-slate-900">{me.code}</span> · {lvl.name} partner{me.joined ? ` since ${new Date(me.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Link href="/affiliates" className="text-primary font-semibold">Program details</Link>
                  {!(view.kind === "ready" && view.demo) && <button onClick={signOut} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900"><LogOut className="w-4 h-4" /> Sign out</button>}
                </div>
              </div>

              <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto mb-8 border-b border-slate-200">
                {TABS.map((t) => (
                  <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                    className={cn("inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px", tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-600 hover:text-slate-900")}>
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>

              {tab === "overview" && <Overview me={me} goLinks={() => setTab("links")} />}
              {tab === "links" && <LinkBuilder code={me.code} />}
              {tab === "referrals" && <ReferralsTable rows={me.referrals} title="All referrals" />}
              {tab === "payouts" && <Payouts me={me} />}
              {tab === "resources" && <Resources code={me.code} />}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
