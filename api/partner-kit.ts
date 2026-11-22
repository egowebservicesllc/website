/**
 * GET /api/partner-kit?doc=plan|guide : the partner program PDFs, built from
 * the live commission settings (also attached to the partner welcome email).
 */
import { guidePdf, planPdf } from "./_lib/partnerKit.js";

const DOCS = {
  plan: { build: planPdf, filename: "EGO-Partner-Program-Commission-Plan.pdf" },
  guide: { build: guidePdf, filename: "EGO-Partner-Quick-Guide.pdf" },
} as const;

export async function GET(request: Request) {
  const doc = new URL(request.url).searchParams.get("doc") as keyof typeof DOCS;
  const d = DOCS[doc];
  if (!d) return new Response("Not found", { status: 404 });
  return new Response((await d.build()) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${d.filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
