import { useState } from "react";
import { ArrowRight, CheckCircle2, Download, Loader2, Lock } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { attributionSummary } from "@/lib/ads";
import { trackLead } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * Short forms for the free offers. Each one is sent to /api/lead like a
 * normal enquiry (ClickUp task, Slack, confirmation + next-steps emails),
 * with the offer name as the "package" so the team knows what was asked for.
 */
export type Offer = "cost-review" | "website-check" | "checklist";

export const OFFERS: Record<Offer, { name: string; serviceId: string; service: string; button: string; done: string }> = {
  "cost-review": {
    name: "Free Cloud Cost Review",
    serviceId: "consulting",
    service: "Cloud Consulting & Migration",
    button: "Get my free cost review",
    done: `Thanks! A senior cloud engineer will email you within ${BUSINESS.responseTime} with how to share your bill securely. Check your inbox for next steps.`,
  },
  "website-check": {
    name: "Free Website Check",
    serviceId: "marketing",
    service: "Digital Marketing",
    button: "Check my website",
    done: `Thanks! We'll run the speed, SEO and mobile checks and email your report within ${BUSINESS.responseTime}.`,
  },
  checklist: {
    name: "Cloud Migration Checklist",
    serviceId: "consulting",
    service: "Cloud Consulting & Migration",
    button: "Download the checklist",
    done: "Your checklist is open in a new tab (use Save as PDF to keep a copy). We've also emailed you the link.",
  },
};

export const CHECKLIST_URL = "/downloads/cloud-migration-checklist.html";

const field = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
const label = "block text-sm font-medium text-slate-900 mb-1.5";

function Select({ name, options, required }: { name: string; options: string[]; required?: boolean }) {
  return (
    <select name={name} required={required} defaultValue="" className={cn(field, "appearance-none")}>
      <option value="" disabled>Choose…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function LeadMagnetForm({ offer, compact = false, dark = false }: { offer: Offer; compact?: boolean; dark?: boolean }) {
  const o = OFFERS[offer];
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    if (v("company_website")) return setState("done"); // honeypot: bots fill hidden fields
    let message = "";
    if (offer === "cost-review") {
      message = `Free cloud cost review request.\nCloud: ${v("cloud")}\nMonthly cloud spend: ${v("spend")}\nWhat runs there: ${v("workloads") || "not given"}`;
    } else if (offer === "website-check") {
      message = `Free website check request.\nWebsite: ${v("site")}\nMain goal: ${v("goal")}`;
    } else {
      message = `Downloaded the cloud migration checklist.\nConsidering: ${v("cloud") || "not given"}`;
    }
    setState("sending");
    if (offer === "checklist") window.open(CHECKLIST_URL, "_blank", "noopener");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v("name"),
          email: v("email"),
          company: v("company") || undefined,
          message,
          services: [o.service],
          serviceId: o.serviceId,
          package: o.name,
          page: window.location.pathname,
          source: attributionSummary() || undefined,
        }),
      });
      if (!r.ok && offer !== "checklist") throw new Error(String(r.status));
      trackLead("lead_magnet", { offer: o.name, services: o.service });
      setState("done");
    } catch {
      setState(offer === "checklist" ? "done" : "error");
    }
  };

  if (state === "done") {
    return (
      <div className={cn("rounded-3xl p-8 text-center", dark ? "bg-white/10 text-white" : "bg-green-50 border border-green-200")} role="status">
        <CheckCircle2 className={cn("w-12 h-12 mx-auto mb-4", dark ? "text-white" : "text-green-600")} />
        <p className={cn("text-lg font-semibold", dark ? "text-white" : "text-slate-900")}>{o.done}</p>
        {offer === "checklist" && (
          <a href={CHECKLIST_URL} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 font-semibold">
            <Download className="w-4 h-4" /> Open the checklist
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
      <div>
        <label className={cn(label, dark && "text-white")} htmlFor={`${offer}-name`}>Name</label>
        <input id={`${offer}-name`} name="name" required autoComplete="name" placeholder="Jane Smith" className={field} />
      </div>
      <div>
        <label className={cn(label, dark && "text-white")} htmlFor={`${offer}-email`}>Work email</label>
        <input id={`${offer}-email`} name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
      </div>

      {offer === "cost-review" && (
        <>
          <div>
            <span className={label}>Which cloud?</span>
            <Select name="cloud" required options={["AWS", "Google Cloud", "Microsoft Azure", "More than one", "Not sure"]} />
          </div>
          <div>
            <span className={label}>Monthly cloud bill</span>
            <Select name="spend" required options={["Under $1,000", "$1,000 – $5,000", "$5,000 – $20,000", "$20,000 – $100,000", "Over $100,000"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="cr-workloads">What runs there? <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea id="cr-workloads" name="workloads" rows={3} maxLength={800} placeholder="e.g. 8 VMs, a PostgreSQL database, Kubernetes for our app" className={cn(field, "h-auto py-3")} />
          </div>
        </>
      )}

      {offer === "website-check" && (
        <>
          <div>
            <label className={label} htmlFor="wc-site">Website address</label>
            <input id="wc-site" name="site" type="url" required placeholder="https://yourcompany.com" className={field} />
          </div>
          <div>
            <span className={label}>Main goal</span>
            <Select name="goal" required options={["More leads or sales", "A faster website", "Rank higher on Google", "Not sure, check everything"]} />
          </div>
        </>
      )}

      {offer === "checklist" && !compact && (
        <div className="sm:col-span-2">
          <span className={cn(label, dark && "text-white")}>Which cloud are you considering? <span className={dark ? "text-blue-100 font-normal" : "text-slate-400 font-normal"}>(optional)</span></span>
          <Select name="cloud" options={["Google Cloud", "AWS", "Microsoft Azure", "Not decided yet"]} />
        </div>
      )}

      {/* Honeypot: hidden from people, bots fill it in. */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />

      <div className={cn(!compact && "sm:col-span-2")}>
        <button type="submit" disabled={state === "sending"} className={cn("w-full h-13 min-h-[52px] rounded-full font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all disabled:opacity-70", dark ? "bg-white text-primary hover:bg-blue-50" : "bg-primary text-white hover:bg-primary/90 shadow-sm")}>
          {state === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : offer === "checklist" ? <Download className="w-5 h-5" /> : null}
          {o.button}
          {state !== "sending" && offer !== "checklist" && <ArrowRight className="w-5 h-5" />}
        </button>
        {state === "error" && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            Something went wrong. Please email us at <a className="underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
          </p>
        )}
        <p className={cn("mt-3 text-xs flex items-center gap-1.5", dark ? "text-blue-100" : "text-slate-500")}>
          <Lock className="w-3.5 h-3.5" /> Free, no obligation. We only use your details to reply to this request.
        </p>
      </div>
    </form>
  );
}
