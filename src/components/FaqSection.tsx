import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import type { FaqItem } from "@/lib/site";

/**
 * FAQ built on native <details> so every answer is in the static HTML
 * (crawlable, and matches the FAQPage structured data from src/lib/site.ts).
 */
export function FaqSection({
  items,
  title = "Frequently asked questions",
  intro,
  className = "py-24 bg-white",
}: {
  items: FaqItem[];
  title?: string;
  intro?: string;
  className?: string;
}) {
  return (
    <section className={className} aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          {intro && <p className="text-lg text-slate-600">{intro}</p>}
        </motion.div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm open:shadow-md open:border-primary/20 transition-all"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 font-semibold text-slate-900 text-lg [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
              </summary>
              <p className="px-5 md:px-6 pb-6 -mt-1 text-slate-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
