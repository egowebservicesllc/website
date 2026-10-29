import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, FileText, Rocket } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { CalendlyWidget } from "@/components/CalendlyWidget";
import { BUSINESS } from "@/lib/site";

/**
 * Shown after a successful quote request. Its URL (/thank-you) can be used
 * as a URL-based conversion in Google Ads, Meta and LinkedIn; the JS
 * conversion events already fire when the form succeeds.
 */
export default function ThankYou() {
  // Read after mount: the page is prerendered, so the first render must match the static HTML.
  const [{ paid, ref }, setPaid] = useState<{ paid: boolean; ref?: string }>({ paid: false });
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("paid") === "1") setPaid({ paid: true, ref: p.get("ref")?.replace(/[^A-Z0-9-]/gi, "").slice(0, 24) });
  }, []);
  return (
    <Layout>
      <Seo path="/thank-you" />
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-20 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            {paid ? "Payment received, thank you!" : "Thanks, your request is in."}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            {paid
              ? `Your project is booked${ref ? ` (reference ${ref})` : ""}. Stripe has emailed your receipt, and a senior engineer will contact you within ${BUSINESS.responseTime} to kick things off. You can also pick a kickoff time below.`
              : `A senior engineer will review your project and reply within ${BUSINESS.responseTime}. We've just emailed you a confirmation; check your spam folder if you don't see it.`}
          </p>
          <p className="mt-8">
            <Link href="/portal" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 font-semibold hover:bg-primary/90">
              Track it in your client portal
            </Link>
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <ol className="grid md:grid-cols-3 gap-6 mb-16">
            {(paid
              ? [
                  { icon: Mail, title: "Payment confirmed", desc: "Your receipt is on its way from Stripe, and our team has been notified." },
                  { icon: FileText, title: "Kickoff call", desc: `We confirm scope, access and milestones within ${BUSINESS.responseTime}.` },
                  { icon: Rocket, title: "We get to work", desc: "You get regular updates in plain English until delivery." },
                ]
              : [
                  { icon: Mail, title: "We review your request", desc: "Your details go straight to our engineering team." },
                  { icon: FileText, title: "You get a proposal", desc: `Scope, timeline and fixed pricing within ${BUSINESS.responseTime}.` },
                  { icon: Rocket, title: "We get to work", desc: "Once you approve, we start, and keep you updated in plain English." },
                ]
            ).map((s, i) => (
              <li key={s.title} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h2>
                <p className="text-slate-600 text-sm">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div id="book-a-call" className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{paid ? "Book your kickoff call" : "Want to move faster?"}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {paid ? "Pick a time that suits you and we'll get your project started." : "Skip the back-and-forth and book a free 30-minute call now."}
            </p>
          </div>
          <CalendlyWidget />

          <p className="text-center text-slate-500 mt-12">
            Meanwhile, see <Link href="/portfolio" className="text-primary font-semibold hover:underline">our work</Link> or{" "}
            <Link href="/pricing" className="text-primary font-semibold hover:underline">pricing</Link>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
