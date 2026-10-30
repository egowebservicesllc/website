import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowUpCircle, CheckCircle2, Copy, CreditCard, Download, ExternalLink, FileText, FolderOpen, KeyRound, LifeBuoy,
  Loader2, LogOut, Mail, MessageSquare, Package, Paperclip, Plus, Send, Server, Upload, XCircle,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Client portal (portal.egowebservices.com, also /portal on the main site).
 * Magic-link sign-in; orders, messages and files are read live from ClickUp
 * through /api/portal; billing opens Stripe's secure customer portal.
 */

const STAGES = ["Received", "In progress", "In review", "Delivered"];
const TICKET_STAGES = ["Open", "In progress", "Waiting on you", "Resolved"];
const TICKET_CATEGORIES = ["Technical problem", "Website or server down", "Email", "Domain or DNS", "Billing", "Upgrade or change plan", "New request", "Other"];
const PRIORITIES = ["Normal", "High", "Urgent (site down)"];
const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "services", label: "Services", icon: Server },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "documents", label: "Documents", icon: FolderOpen },
] as const;
type Tab = (typeof TABS)[number]["id"];
const PLATFORM: Record<string, string> = { cpanel: "cPanel / WHM", plesk: "Plesk", vm: "Virtual server (root / SSH)", cloud: "Managed cloud", hosting: "Hosting" };

type Kind = "order" | "service" | "ticket" | "request";
interface OrderSummary {
  id: string; kind: Kind; title: string; ref: string; stage: number; stageLabel: string;
  payment: "awaiting" | "paid" | null; isOrder: boolean; created: number | null; updated: number | null;
  ticket?: { category: string; priority: string; serviceId?: string }; platform?: string;
}
interface Details { items: { label: string; value: string; link?: string; hidden?: boolean }[]; notes: string[]; updated: number | null }
interface OrderDetail extends OrderSummary {
  messages: { id: string; from: "client" | "team"; text: string; date: number }[];
  files: { id: string; name: string; url?: string; size?: number; date: number | null }[];
  details?: Details | null;
}
interface Service {
  id: string; title: string; ref: string; platform: string; status: string; created: number | null;
  billing: { subscription: string; amount: string; renews: number | null; endsAt: number | null; status: string } | null;
  details: Details | null;
}
interface Doc { id: string; name: string; url?: string; size?: number; date: number | null; from: "you" | "team"; taskId: string; taskTitle: string; kind: Kind }

const mainSite = () => (window.location.hostname.startsWith("portal.") ? "https://www.egowebservices.com" : "");
const fmtDate = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const fmtSize = (b?: number) => (!b ? "" : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

async function api<T = any>(action: string, opts: { method?: "GET" | "POST"; body?: unknown; query?: string; form?: FormData } = {}): Promise<T> {
  const res = await fetch(`/api/portal?action=${action}${opts.query ? `&${opts.query}` : ""}`, {
    method: opts.method || "GET",
    credentials: "same-origin",
    headers: opts.form ? undefined : opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.form || (opts.body ? JSON.stringify(opts.body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Something went wrong."), { status: res.status });
  return data;
}

function Stepper({ stage, compact, labels = STAGES }: { stage: number; compact?: boolean; labels?: string[] }) {
  return (
    <ol className={cn("flex items-center w-full", compact ? "gap-1.5" : "gap-2")}>
      {labels.map((s, i) => (
        <li key={s} className="flex-1 min-w-0">
          <div className={cn("h-2 rounded-full", i <= stage ? "bg-primary" : "bg-slate-200")} />
          {!compact && <p className={cn("mt-2 text-xs sm:text-sm font-semibold truncate", i <= stage ? "text-primary" : "text-slate-400")}>{s}</p>}
        </li>
      ))}
    </ol>
  );
}

function PaymentBadge({ payment }: { payment: OrderSummary["payment"] }) {
  if (!payment) return null;
  return payment === "paid" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold"><CreditCard className="w-3.5 h-3.5" /> Awaiting payment</span>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Active" ? "bg-green-50 text-green-700 border-green-200"
    : status === "Setting up" ? "bg-blue-50 text-primary border-blue-200"
    : status === "Payment due" || status === "Awaiting payment" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold", tone)}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority.startsWith("Urgent")) return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-xs font-bold"><AlertTriangle className="w-3.5 h-3.5" /> Urgent</span>;
  if (priority === "High") return <span className="rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 text-xs font-bold">High</span>;
  return null;
}

/** Access details posted by the team (passwords are never shown). */
function DetailsPanel({ details, platform }: { details: Details | null | undefined; platform?: string }) {
  const [copied, setCopied] = useState("");
  if (!details || !details.items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800 mb-1">We're setting this up</p>
        <p>Your {platform ? PLATFORM[platform] || "service" : "service"} access details will appear here as soon as it's ready, and we'll email you.</p>
      </div>
    );
  }
  const copy = (v: string) => { navigator.clipboard?.writeText(v).then(() => { setCopied(v); setTimeout(() => setCopied(""), 1500); }).catch(() => {}); };
  return (
    <div>
      <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
        {details.items.map((d, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3">
            <dt className="sm:w-44 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{d.label}</dt>
            <dd className="flex-1 min-w-0 flex items-center gap-2">
              {d.hidden ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><KeyRound className="w-4 h-4" /> {d.value}</span>
              ) : d.link ? (
                <a href={d.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline break-all inline-flex items-center gap-1">{d.value} <ExternalLink className="w-3.5 h-3.5 shrink-0" /></a>
              ) : (
                <span className="text-sm font-mono text-slate-800 break-all">{d.value}</span>
              )}
              {!d.hidden && (
                <button type="button" onClick={() => copy(d.value)} className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100" aria-label={`Copy ${d.label}`}>
                  {copied === d.value ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {details.notes.length > 0 && <div className="mt-3 text-sm text-slate-600 space-y-1">{details.notes.map((n, i) => <p key={i}>{n}</p>)}</div>}
      <p className="mt-3 text-xs text-slate-500">For your security, passwords are never shown here. We share them separately.</p>
    </div>
  );
}

export default function Portal() {
  const [state, setState] = useState<"loading" | "signedOut" | "sent" | "in">("loading");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [services, setServices] = useState<Service[] | null>(null);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [docFilter, setDocFilter] = useState<"all" | "team" | "you">("all");
  const [ticket, setTicket] = useState<{ open: boolean; serviceId: string; category: string; priority: string; subject: string; text: string }>({ open: false, serviceId: "", category: TICKET_CATEGORIES[0], priority: "Normal", subject: "", text: "" });
  // Links back to the main site (absolute on portal.egowebservices.com); set after mount to match the prerendered HTML.
  const [S, setS] = useState("");
  useEffect(() => setS(mainSite()), []);
  const site = () => S;

  const loadOrders = useCallback(async () => {
    const d = await api<{ email: string; orders: OrderSummary[] }>("orders");
    setEmail(d.email);
    setOrders(d.orders);
  }, []);

  const loadServices = useCallback(async () => {
    const d = await api<{ services: Service[] }>("services");
    setServices(d.services);
  }, []);

  const loadDocs = useCallback(async () => {
    const d = await api<{ documents: Doc[] }>("documents");
    setDocs(d.documents);
  }, []);

  const loadOrder = useCallback(async (id: string) => {
    setOrder(null);
    const d = await api<{ order: OrderDetail }>("order", { query: `id=${encodeURIComponent(id)}` });
    setOrder(d.order);
  }, []);

  // Start: exchange a magic-link token, or check the existing session.
  useEffect(() => {
    (async () => {
      const p = new URLSearchParams(window.location.search);
      const token = p.get("token");
      const id = p.get("order");
      const t = p.get("tab") as Tab | null;
      if (t && TABS.some((x) => x.id === t)) setTab(t);
      try {
        if (token) {
          await api("session", { method: "POST", body: { token } });
          p.delete("token");
          window.history.replaceState(null, "", `${window.location.pathname}${p.toString() ? `?${p}` : ""}`);
        }
        await loadOrders();
        setState("in");
        if (id) setOrderId(id);
      } catch (err: any) {
        if (token) setError(err.message);
        setState("signedOut");
      }
    })();
    const onPop = () => {
      const p = new URLSearchParams(window.location.search);
      setOrderId(p.get("order"));
      const t = p.get("tab") as Tab | null;
      setTab(t && TABS.some((x) => x.id === t) ? t : "orders");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loadOrders]);

  useEffect(() => {
    if (state === "in" && orderId) loadOrder(orderId).catch((e) => setError(e.message));
    if (!orderId) setOrder(null);
  }, [state, orderId, loadOrder]);

  useEffect(() => {
    if (state !== "in" || orderId) return;
    if ((tab === "services" || tab === "support") && !services) loadServices().catch((e) => setError(e.message));
    if (tab === "documents" && !docs) loadDocs().catch((e) => setError(e.message));
  }, [state, tab, orderId, services, docs, loadServices, loadDocs]);

  const switchTab = (t: Tab) => {
    setError(""); setNotice("");
    const p = new URLSearchParams(window.location.search);
    p.delete("order");
    if (t === "orders") p.delete("tab"); else p.set("tab", t);
    window.history.pushState(null, "", `${window.location.pathname}${p.toString() ? `?${p}` : ""}`);
    setOrderId(null);
    setTab(t);
  };

  const startTicket = (serviceId = "", category = TICKET_CATEGORIES[0]) => {
    setTicket({ open: true, serviceId, category, priority: "Normal", subject: category === "Upgrade or change plan" ? "Upgrade or change my plan" : "", text: "" });
    if (tab !== "support") switchTab("support");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy("ticket");
    try {
      const d = await api<{ ref: string }>("ticket", { method: "POST", body: { serviceId: ticket.serviceId || undefined, category: ticket.category, priority: ticket.priority, subject: ticket.subject, text: ticket.text } });
      setTicket((t) => ({ ...t, open: false, subject: "", text: "" }));
      setNotice(`Request ${d.ref} sent. We've emailed you a confirmation${ticket.priority.startsWith("Urgent") ? " and alerted the team" : ""}.`);
      await loadOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const cancelService = async (subscription: string) => {
    setError(""); setBusy(`cancel:${subscription}`);
    try {
      const d = await api<{ url: string }>("cancel", { method: "POST", body: { subscription } });
      window.location.assign(d.url);
    } catch (err: any) {
      setError(err.message);
      setBusy("");
    }
  };

  const openOrder = (id: string | null) => {
    setError(""); setNotice("");
    const p = new URLSearchParams(window.location.search);
    if (id) p.set("order", id); else p.delete("order");
    window.history.pushState(null, "", `${window.location.pathname}${p.toString() ? `?${p}` : ""}`);
    setOrderId(id);
    window.scrollTo({ top: 0 });
    if (!id) loadOrders().catch(() => {});
  };

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy("login");
    try {
      await api("login", { method: "POST", body: { email: loginEmail } });
      setState("sent");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const logout = async () => {
    await api("logout", { method: "POST" }).catch(() => {});
    setOrders(null); setOrder(null); setEmail(""); setState("signedOut");
    openOrder(null);
  };

  const billing = async () => {
    setError(""); setBusy("billing");
    try {
      const d = await api<{ url: string }>("billing", { method: "POST" });
      window.location.assign(d.url);
    } catch (err: any) {
      setError(err.message);
      setBusy("");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !msg.trim()) return;
    setError(""); setBusy("msg");
    try {
      await api("message", { method: "POST", body: { id: order.id, text: msg } });
      setMsg("");
      setNotice("Message sent. We'll reply here and by email.");
      await loadOrder(order.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const upload = async (file?: File) => {
    if (!order || !file) return;
    setError(""); setNotice("");
    if (file.size > 4 * 1024 * 1024) { setError("Files must be 4 MB or smaller. For bigger files, share a link in a message."); return; }
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api("upload", { method: "POST", query: `id=${encodeURIComponent(order.id)}`, form: fd });
      setNotice(`Uploaded ${file.name}.`);
      await loadOrder(order.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Seo path="/portal" />
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl h-16 flex items-center justify-between gap-4">
          <a href={site() || "/"} className="flex items-center gap-3">
            <BrandLogo size={34} />
            <span className="font-bold text-slate-900 hidden sm:inline">EGO Web Services</span>
            <span className="rounded-full bg-blue-50 text-primary border border-blue-100 px-2.5 py-0.5 text-xs font-bold">Client portal</span>
          </a>
          {state === "in" && (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-slate-500">{email}</span>
              <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
        {(error || notice) && (
          <div className={cn("mb-6 rounded-2xl border p-4 text-sm font-medium", error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800")} role="status">
            {error || notice}
          </div>
        )}

        {state === "loading" && <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

        {(state === "signedOut" || state === "sent") && (
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            {state === "sent" ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-6"><Mail className="w-8 h-8" /></div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your inbox</h1>
                <p className="text-slate-600">If <b>{loginEmail}</b> has orders or requests with us, we've emailed a sign-in link. It works for 20 minutes. Check spam too.</p>
                <button type="button" onClick={() => setState("signedOut")} className="mt-6 text-sm font-semibold text-primary hover:underline">Use a different email</button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Sign in to your portal</h1>
                <p className="text-slate-600 mb-8">Follow your orders, message our team, share files and manage billing. Use the email you ordered or contacted us with.</p>
                <form onSubmit={requestLink} className="space-y-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-1.5">Email</span>
                    <input type="email" required autoComplete="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </label>
                  <Button type="submit" disabled={busy === "login"} className="w-full h-12 rounded-full font-semibold">
                    {busy === "login" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Email me a sign-in link"}
                  </Button>
                </form>
                <p className="mt-6 text-xs text-slate-500 text-center">No password needed. We'll send a secure one-time link.</p>
              </>
            )}
          </div>
        )}

        {state === "in" && !orderId && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Your account</h1>
                <p className="text-slate-600 mt-1">Orders, services, support and documents in one place.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={billing} disabled={busy === "billing"} className="rounded-full bg-white">
                  {busy === "billing" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />} Billing & invoices
                </Button>
                <Button asChild className="rounded-full"><a href={`${site()}/pricing`}><Plus className="w-4 h-4 mr-2" /> New order</a></Button>
              </div>
            </div>

            <div role="tablist" aria-label="Portal sections" className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                const count = t.id === "support" ? (orders || []).filter((o) => o.kind === "ticket" && o.stage < 3).length : 0;
                return (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => switchTab(t.id)}
                    className={cn("flex-1 shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-[13px] sm:text-sm font-semibold transition-colors whitespace-nowrap",
                      tab === t.id ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100")}>
                    <Icon className="hidden sm:block w-4 h-4" /> {t.label}
                    {count > 0 && <span className={cn("rounded-full px-1.5 text-[11px]", tab === t.id ? "bg-white/25" : "bg-primary/10 text-primary")}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {tab === "orders" && (() => {
              const list = (orders || []).filter((o) => o.kind === "order" || o.kind === "request");
              return !orders ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : list.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
                  <p className="text-slate-600 mb-6">Orders and requests you make with {email} will appear here.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="rounded-full"><a href={`${site()}/pricing`}>See packages</a></Button>
                    <Button asChild variant="outline" className="rounded-full"><a href={`${site()}/contact`}>Request a quote</a></Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {list.map((o) => (
                    <li key={o.id}>
                      <button type="button" onClick={() => openOrder(o.id)} className="w-full text-left bg-white rounded-3xl border border-slate-200 p-6 hover:border-primary/40 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 truncate">{o.title}</h2>
                            <p className="text-sm text-slate-500">{o.ref}{o.created ? ` · ${fmtDate(o.created)}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PaymentBadge payment={o.payment} />
                            <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-bold">{o.stageLabel}</span>
                          </div>
                        </div>
                        <Stepper stage={o.stage} compact />
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()}

            {tab === "services" && (
              !services ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                  <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">No active services</h2>
                  <p className="text-slate-600 mb-6">Hosting plans, servers and managed cloud services appear here once they're paid for.</p>
                  <Button asChild className="rounded-full"><a href={`${site()}/pricing`}>See hosting plans</a></Button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {services.map((sv) => {
                    const panel = sv.details?.items.find((d) => d.link);
                    const canCancel = sv.billing && !sv.billing.endsAt && sv.billing.status !== "canceled";
                    return (
                      <li key={sv.id} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h2 className="text-xl font-bold text-slate-900">{sv.title}</h2>
                              <StatusPill status={sv.status} />
                            </div>
                            <p className="text-sm text-slate-500">{PLATFORM[sv.platform] || "Service"}{sv.ref ? ` · ${sv.ref}` : ""}</p>
                          </div>
                          {sv.billing && (
                            <div className="sm:text-right">
                              <p className="text-lg font-extrabold text-slate-900">{sv.billing.amount}</p>
                              <p className="text-xs text-slate-500">
                                {sv.billing.endsAt ? `Ends ${fmtDate(sv.billing.endsAt)}` : sv.billing.renews ? `Renews ${fmtDate(sv.billing.renews)}` : sv.billing.status === "canceled" ? "Cancelled" : ""}
                              </p>
                            </div>
                          )}
                        </div>
                        <DetailsPanel details={sv.details} platform={sv.platform} />
                        <div className="mt-6 flex flex-wrap gap-3">
                          {panel?.link && (
                            <Button asChild className="rounded-full"><a href={panel.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Open {panel.label.toLowerCase().includes("panel") ? "control panel" : panel.label}</a></Button>
                          )}
                          <Button type="button" variant="outline" className="rounded-full" onClick={() => startTicket(sv.id)}><LifeBuoy className="w-4 h-4 mr-2" /> Get help</Button>
                          <Button type="button" variant="outline" className="rounded-full" onClick={() => startTicket(sv.id, "Upgrade or change plan")}><ArrowUpCircle className="w-4 h-4 mr-2" /> Upgrade plan</Button>
                          <Button type="button" variant="outline" className="rounded-full" onClick={() => openOrder(sv.id)}><MessageSquare className="w-4 h-4 mr-2" /> Messages & files</Button>
                          {canCancel && (
                            <Button type="button" variant="ghost" className="rounded-full text-slate-500 hover:text-red-700" disabled={busy === `cancel:${sv.billing!.subscription}`} onClick={() => cancelService(sv.billing!.subscription)}>
                              {busy === `cancel:${sv.billing!.subscription}` ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} Cancel
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            )}

            {tab === "support" && (
              <div className="space-y-6">
                {!ticket.open ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Need help?</h2>
                      <p className="text-slate-600 text-sm mt-1">Open a request and our engineers will reply here and by email. Urgent issues alert the team right away.</p>
                    </div>
                    <Button type="button" className="rounded-full shrink-0" onClick={() => startTicket()}><Plus className="w-4 h-4 mr-2" /> New request</Button>
                  </div>
                ) : (
                  <form onSubmit={submitTicket} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-5">
                    <h2 className="text-xl font-bold text-slate-900">New support request</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-1.5">Service</span>
                        <select value={ticket.serviceId} onChange={(e) => setTicket((t) => ({ ...t, serviceId: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="">General / not about a service</option>
                          {(services || []).map((sv) => <option key={sv.id} value={sv.id}>{sv.title}{sv.ref ? ` (${sv.ref})` : ""}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-1.5">Topic</span>
                        <select value={ticket.category} onChange={(e) => setTicket((t) => ({ ...t, category: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                          {TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</span>
                        <select value={ticket.priority} onChange={(e) => setTicket((t) => ({ ...t, priority: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                          {PRIORITIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                    </div>
                    {ticket.priority.startsWith("Urgent") && (
                      <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> Use Urgent only when a website, server or email is down. The team is alerted immediately.</p>
                    )}
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</span>
                      <input required maxLength={120} value={ticket.subject} onChange={(e) => setTicket((t) => ({ ...t, subject: e.target.value }))} placeholder="e.g. Website shows a 500 error" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1.5">Describe the issue</span>
                      <textarea required rows={5} maxLength={4000} value={ticket.text} onChange={(e) => setTicket((t) => ({ ...t, text: e.target.value }))} placeholder="What happened, when it started, any error message, and the page or domain affected. Never include passwords." className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </label>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                      <Button type="button" variant="ghost" className="rounded-full" onClick={() => setTicket((t) => ({ ...t, open: false }))}>Cancel</Button>
                      <Button type="submit" disabled={busy === "ticket"} className="rounded-full">{busy === "ticket" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send request</Button>
                    </div>
                    <p className="text-xs text-slate-500">You can attach screenshots after sending, from the request page.</p>
                  </form>
                )}

                {(() => {
                  const list = (orders || []).filter((o) => o.kind === "ticket");
                  if (!orders) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
                  if (!list.length) return <p className="text-center text-slate-500 py-6">No support requests yet.</p>;
                  return (
                    <ul className="space-y-3">
                      {list.map((o) => (
                        <li key={o.id}>
                          <button type="button" onClick={() => openOrder(o.id)} className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-md transition-all">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{o.title}</h3>
                                <p className="text-sm text-slate-500">{o.ref} · {o.ticket?.category}{o.created ? ` · ${fmtDate(o.created)}` : ""}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {o.ticket && <PriorityBadge priority={o.ticket.priority} />}
                                <span className={cn("rounded-full px-3 py-1 text-xs font-bold", o.stage === 3 ? "bg-green-50 text-green-700" : o.stage === 2 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700")}>{o.stageLabel}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            )}

            {tab === "documents" && (
              !docs ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : docs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                  <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">No documents yet</h2>
                  <p className="text-slate-600">Reports, designs, deliverables and files you share with us will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6">
                  <div className="flex gap-2 mb-4">
                    {([["all", "All"], ["team", "From EGO"], ["you", "Uploaded by you"]] as const).map(([k, l]) => (
                      <button key={k} type="button" onClick={() => setDocFilter(k)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold", docFilter === k ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{l}</button>
                    ))}
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {docs.filter((d) => docFilter === "all" || d.from === docFilter).map((d) => (
                      <li key={d.id} className="flex items-center gap-3 py-3">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <a href={d.url} target="_blank" rel="noopener" className="block text-sm font-semibold text-slate-800 hover:text-primary truncate">{d.name}</a>
                          <p className="text-xs text-slate-500 truncate">
                            <button type="button" onClick={() => openOrder(d.taskId)} className="hover:text-primary hover:underline">{d.taskTitle}</button>
                            {" · "}{d.from === "team" ? "From EGO" : "Uploaded by you"}{d.date ? ` · ${fmtDate(d.date)}` : ""}{d.size ? ` · ${fmtSize(d.size)}` : ""}
                          </p>
                        </div>
                        <a href={d.url} target="_blank" rel="noopener" className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-primary hover:bg-slate-100" aria-label={`Download ${d.name}`}><Download className="w-4 h-4" /></a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </>
        )}

        {state === "in" && orderId && (
          <>
            <button type="button" onClick={() => openOrder(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to {TABS.find((t) => t.id === tab)?.label.toLowerCase() || "orders"}
            </button>
            {!order ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{order.title}</h1>
                      <p className="text-slate-500 mt-1">{order.ref}{order.created ? ` · Placed ${fmtDate(order.created)}` : ""}{order.updated ? ` · Updated ${fmtDate(order.updated)}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.ticket && <PriorityBadge priority={order.ticket.priority} />}
                      <PaymentBadge payment={order.payment} />
                    </div>
                  </div>
                  {order.kind === "service" ? (
                    <DetailsPanel details={order.details} platform={order.platform} />
                  ) : (
                    <Stepper stage={order.stage} labels={order.kind === "ticket" ? TICKET_STAGES : STAGES} />
                  )}
                  {order.payment === "awaiting" && (
                    <p className="mt-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      We haven't received payment for this order yet. If you closed the payment page, place the order again from our <a href={`${site()}/pricing`} className="font-semibold underline">pricing page</a> or message us below.
                    </p>
                  )}
                </div>

                <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
                  <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-5"><MessageSquare className="w-5 h-5 text-primary" /> Messages</h2>
                    <div className="space-y-4 mb-6">
                      {order.messages.length === 0 && <p className="text-slate-500 text-sm">No messages yet. Ask us anything about this order.</p>}
                      {order.messages.map((m) => (
                        <div key={m.id} className={cn("max-w-[90%] rounded-2xl px-4 py-3", m.from === "client" ? "ml-auto bg-primary text-white" : "bg-slate-100 text-slate-800")}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                          <p className={cn("mt-1.5 text-[11px]", m.from === "client" ? "text-blue-100" : "text-slate-500")}>{m.from === "client" ? "You" : "EGO team"} · {fmtDate(m.date)}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} className="space-y-3">
                      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={4000} placeholder="Write a message to our team…" className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={busy === "msg" || !msg.trim()} className="rounded-full">
                          {busy === "msg" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send message
                        </Button>
                      </div>
                    </form>
                  </section>

                  <aside className="space-y-6">
                    <section className="bg-white rounded-3xl border border-slate-200 p-6">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4"><Paperclip className="w-5 h-5 text-primary" /> Files</h2>
                      <ul className="space-y-2 mb-5">
                        {order.files.length === 0 && <li className="text-slate-500 text-sm">No files yet.</li>}
                        {order.files.map((f) => (
                          <li key={f.id}>
                            <a href={f.url} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 hover:border-primary/40 hover:bg-slate-50">
                              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800 truncate">{f.name}</span><span className="block text-xs text-slate-500">{[fmtSize(f.size), fmtDate(f.date)].filter(Boolean).join(" · ")}</span></span>
                              <Download className="w-4 h-4 text-slate-400" />
                            </a>
                          </li>
                        ))}
                      </ul>
                      <input ref={fileRef} type="file" className="hidden" onChange={(e) => upload(e.target.files?.[0])} accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.ai,.eps,.psd,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md" />
                      <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy === "upload"} className="w-full rounded-full">
                        {busy === "upload" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Upload a file
                      </Button>
                      <p className="mt-2 text-xs text-slate-500 text-center">Up to 4 MB. PDF, images, Office, ZIP.</p>
                    </section>
                    <section className="bg-white rounded-3xl border border-slate-200 p-6">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-2"><CreditCard className="w-5 h-5 text-primary" /> Billing</h2>
                      <p className="text-sm text-slate-600 mb-4">Invoices, receipts, payment methods and subscriptions.</p>
                      <Button type="button" variant="outline" onClick={billing} disabled={busy === "billing"} className="w-full rounded-full">
                        {busy === "billing" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Open billing
                      </Button>
                    </section>
                  </aside>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} EGO Web Services LLC</p>
          <p className="flex gap-4">
            <a href={`${site()}/support`} className="hover:text-primary">Support</a>
            <a href={`mailto:${BUSINESS.email}`} className="hover:text-primary">{BUSINESS.email}</a>
            <a href={`${site()}/privacy`} className="hover:text-primary">Privacy</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
