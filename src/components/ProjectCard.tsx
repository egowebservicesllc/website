import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { initials, type Project } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/** Card for one client project (data in src/lib/portfolio.ts). */
export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const p = project;
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl overflow-hidden transition-shadow"
    >
      {/* Visual: screenshot in a browser frame, or a branded monogram */}
      <div className="relative bg-slate-100">
        <div className="flex items-center gap-1.5 px-4 h-8 bg-slate-200/70 border-b border-slate-200" aria-hidden="true">
          <i className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <i className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <i className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          {p.url && (
            <span className="ml-3 text-[11px] text-slate-500 truncate">{p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
          )}
        </div>
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/9]" : "aspect-[16/10]")}>
          {p.image ? (
            <img
              src={p.image}
              alt={`${p.name} website`}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${p.accent} 0%, ${p.accent}cc 55%, #0f172a 140%)` }}
            >
              <span className="text-white/95 font-extrabold tracking-tight text-6xl drop-shadow-sm">{initials(p.name)}</span>
              <span className="absolute bottom-4 left-5 text-white/85 font-semibold text-sm">{p.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{p.category}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
        {!compact && <p className="text-slate-600 leading-relaxed">{p.summary}</p>}
        {p.result && !compact && <p className="font-semibold text-slate-900">{p.result}</p>}
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {p.services.map((s) => (
            <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
              {s}
            </span>
          ))}
        </div>
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all pt-1"
          >
            Visit website <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
