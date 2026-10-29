import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, CheckCircle2, CreditCard, Download, FileText, Loader2, LogOut, Mail, MessageSquare, Package, Paperclip, Plus, Send, Upload,
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

interface OrderSummary {
  id: string; title: string; ref: string; stage: number; stageLabel: string;
  payment: "awaiting" | "paid" | null; isOrder: boolean; created: number | null; updated: number | null;
}
interface OrderDetail extends OrderSummary {
  messages: { id: string; from: "client" | "team"; text: string; date: number }[];
  files: { id: string; name: string; url?: string; size?: number; date: number | null }[];
}

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

function Stepper({ stage, compact }: { stage: number; compact?: boolean }) {
  return (
    <ol className={cn("flex items-center w-full", compact ? "gap-1.5" : "gap-2")}>
      {STAGES.map((s, i) => (
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
  // Links back to the main site (absolute on portal.egowebservices.com); set after mount to match the prerendered HTML.
  const [S, setS] = useState("");
  useEffect(() => setS(mainSite()), []);
  const site = () => S;

  const loadOrders = useCallback(async () => {
    const d = await api<{ email: string; orders: OrderSummary[] }>("orders");
    setEmail(d.email);
    setOrders(d.orders);
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
    const onPop = () => setOrderId(new URLSearchParams(window.location.search).get("order"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loadOrders]);

  useEffect(() => {
    if (state === "in" && orderId) loadOrder(orderId).catch((e) => setError(e.message));
    if (!orderId) setOrder(null);
  }, [state, orderId, loadOrder]);

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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Your orders</h1>
                <p className="text-slate-600 mt-1">Track progress, message our team and share files.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={billing} disabled={busy === "billing"} className="rounded-full bg-white">
                  {busy === "billing" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />} Billing & invoices
                </Button>
                <Button asChild className="rounded-full"><a href={`${site()}/pricing`}><Plus className="w-4 h-4 mr-2" /> New order</a></Button>
              </div>
            </div>
            {!orders ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : orders.length === 0 ? (
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
                {orders.map((o) => (
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
            )}
          </>
        )}

        {state === "in" && orderId && (
          <>
            <button type="button" onClick={() => openOrder(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" /> All orders
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
                    <PaymentBadge payment={order.payment} />
                  </div>
                  <Stepper stage={order.stage} />
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
