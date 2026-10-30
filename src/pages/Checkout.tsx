import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Check, Lock, ShieldCheck, ArrowRight, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ORDER_FIELDS, findCheckoutPackage, priceLabel } from "@/lib/checkout";
import { attributionSummary } from "@/lib/ads";
import { track } from "@/lib/track";
import { BUSINESS } from "@/lib/site";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * "Buy now" order form for fixed-price packages (/checkout?service=…&package=…).
 * Collects the details we need to start, then hands over to Stripe Checkout.
 */
export default function Checkout() {
  // Read the query after mount: the page is prerendered as an empty shell.
  const [q, setQ] = useState<{ service: string; package: string; canceled: boolean } | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({ service: p.get("service") || "", package: p.get("package") || "", canceled: p.get("canceled") === "1" });
  }, []);
  const found = useMemo(() => (q ? findCheckoutPackage(q.service, q.package) : null), [q]);

  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", country: "", notes: "", website: "" });
  const [details, setDetails] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (found) track("begin_checkout", { service: found.service.id, package: found.pkg.name });
  }, [found]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!found) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service: found.service.id, package: found.pkg.name, details, terms, source: attributionSummary() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        // Online payment not switched on yet: send it as a lead so the order still reaches the team.
        const extra = Object.entries(details).filter(([, v]) => v).map(([k, v]) => `${(ORDER_FIELDS[found.service.id] || []).find((f) => f.id === k)?.label || k}: ${v}`);
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, email: form.email, company: form.company, phone: form.phone, country: form.country,
            message: [`Order request: ${found.pkg.name} (${priceLabel(found.pkg)})`, ...extra, form.notes].filter(Boolean).join("\n"),
            services: [found.service.title], serviceId: found.service.id, package: found.pkg.name, source: attributionSummary(), page: "/checkout",
          }),
        }).catch(() => {});
        window.location.assign(`/thank-you?service=${encodeURIComponent(found.service.id)}`);
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
      track("add_payment_info", { service: found.service.id, package: found.pkg.name });
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Layout>
      <Seo path="/checkout" />
      <section className="bg-slate-50 pt-16 pb-24 md:pt-24 border-b border-slate-200 min-h-[70vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {!q ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !found ? (
            <div className="max-w-xl mx-auto text-center py-16">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Choose a package to order</h1>
              <p className="text-lg text-slate-600 mb-8">This package can't be bought online. Pick a fixed-price package on our pricing page, or request a free quote.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="rounded-full h-12 px-8"><Link href="/pricing">See pricing</Link></Button>
                <Button asChild variant="outline" className="rounded-full h-12 px-8 bg-white"><Link href="/contact">Get a free quote</Link></Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Secure checkout</p>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">Order {found.pkg.name}</h1>
              </div>
              {q.canceled && (
                <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p>Payment was cancelled, so nothing was charged. You can review your details and try again.</p>
                </div>
              )}
              <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
                <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 space-y-8">
                  <fieldset className="space-y-5">
                    <legend className="text-xl font-bold text-slate-900 mb-1">Your details</legend>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Full name *</span><input required className={input} value={form.name} onChange={set("name")} autoComplete="name" /></label>
                      <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</span><input required type="email" className={input} value={form.email} onChange={set("email")} autoComplete="email" /></label>
                      <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Company</span><input className={input} value={form.company} onChange={set("company")} autoComplete="organization" /></label>
                      <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Phone / WhatsApp</span><input type="tel" className={input} value={form.phone} onChange={set("phone")} autoComplete="tel" /></label>
                      <label className="block sm:col-span-2"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Country</span><input className={input} value={form.country} onChange={set("country")} autoComplete="country-name" /></label>
                    </div>
                  </fieldset>

                  {(ORDER_FIELDS[found.service.id] || []).length > 0 && (
                    <fieldset className="space-y-5">
                      <legend className="text-xl font-bold text-slate-900 mb-1">About your project</legend>
                      {ORDER_FIELDS[found.service.id].map((f) => (
                        <label key={f.id} className="block">
                          <span className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}{f.required ? " *" : ""}</span>
                          {f.type === "textarea" ? (
                            <textarea required={f.required} rows={4} className={input} placeholder={f.placeholder} value={details[f.id] || ""} onChange={(e) => setDetails((d) => ({ ...d, [f.id]: e.target.value }))} />
                          ) : f.type === "select" ? (
                            <select required={f.required} className={input} value={details[f.id] || ""} onChange={(e) => setDetails((d) => ({ ...d, [f.id]: e.target.value }))}>
                              <option value="">Choose…</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input required={f.required} className={input} placeholder={f.placeholder} value={details[f.id] || ""} onChange={(e) => setDetails((d) => ({ ...d, [f.id]: e.target.value }))} />
                          )}
                        </label>
                      ))}
                    </fieldset>
                  )}

                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-1.5">Anything else we should know?</span>
                    <textarea rows={3} className={input} value={form.notes} onChange={set("notes")} placeholder="Optional" />
                  </label>
                  <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />

                  <label className="flex items-start gap-3 text-sm text-slate-600">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-primary,#005fc2)]" required />
                    <span>I agree to the <Link href="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> (including the <a href="/terms#refunds" className="text-primary font-semibold hover:underline">refund policy</a>) and <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.</span>
                  </label>

                  {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /><p>{error}</p></div>}

                  <Button type="submit" disabled={busy} className="w-full h-14 rounded-full text-lg font-semibold">
                    {busy ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Opening secure payment…</> : <><Lock className="w-5 h-5 mr-2" /> Continue to secure payment</>}
                  </Button>
                  <p className="text-center text-sm text-slate-500">You'll pay on Stripe's secure checkout. Card details never touch our servers.</p>
                </form>

                <aside className="lg:sticky lg:top-28 space-y-4">
                  <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-sm p-6">
                    <p className="text-sm font-semibold text-slate-500 mb-1">{found.service.title}</p>
                    <h2 className="text-2xl font-bold text-slate-900">{found.pkg.name}</h2>
                    <p className="mt-3 text-4xl font-extrabold text-primary">{priceLabel(found.pkg)}</p>
                    <p className="text-sm text-slate-500 mt-1">{found.pkg.checkout?.mode === "subscription" ? "Billed monthly. Cancel any time from your client portal." : "One-time payment."}</p>
                    <ul className="mt-6 space-y-3">
                      {found.pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-slate-700"><Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 text-sm text-slate-600">
                    <p className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-primary" /> Secure payment by Stripe</p>
                    <p className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-primary" /> Receipt and invoice by email</p>
                    <p className="flex items-center gap-3"><ArrowRight className="w-5 h-5 text-primary" /> We start within {BUSINESS.responseTime}</p>
                  </div>
                  <p className="text-sm text-slate-500 px-2">Questions first? <Link href="/contact" className="text-primary font-semibold hover:underline">Talk to us</Link>.</p>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
