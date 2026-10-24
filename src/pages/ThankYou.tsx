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
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Thanks, your request is in.</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            A senior engineer will review your project and reply within {BUSINESS.responseTime}. Keep an eye on your inbox (and spam folder) for an email from {BUSINESS.email}.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <ol className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Mail, title: "We review your request", desc: "Your details go straight to our engineering team." },
              { icon: FileText, title: "You get a proposal", desc: `Scope, timeline and fixed pricing within ${BUSINESS.responseTime}.` },
              { icon: Rocket, title: "We get to work", desc: "Once you approve, we start, and keep you updated in plain English." },
            ].map((s, i) => (
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Want to move faster?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Skip the back-and-forth and book a free 30-minute call now.
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
