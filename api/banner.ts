/**
 * GET /api/banner?file=banner-1200x628 : a partner banner with the real EGO
 * logo built in. The banner SVGs in /public/partners mark where the logo goes
 * (<g id="logo" data-box="x,y,w,h" data-logo="white|icon">); this swaps that
 * placeholder for the logo PNG as an embedded image, so the banner works in
 * <img> tags, embed codes and the dashboard's PNG download.
 */
import { ENV } from "./_lib/env.js";

const LOGOS: Record<string, string> = {
  white: "/brand/ego-logo-horizontal-white.png",
  icon: "/brand/ego-icon-512.png",
};

const cache = new Map<string, Promise<string | null>>();
function dataUri(path: string) {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(`${ENV.siteUrl}${path}`)
        .then(async (r) => (r.ok ? `data:image/png;base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}` : null))
        .catch(() => null),
    );
  }
  return cache.get(path)!;
}

export async function GET(request: Request) {
  const file = new URL(request.url).searchParams.get("file") || "";
  if (!/^banner-\d{2,4}x\d{2,4}$/.test(file)) return new Response("Not found", { status: 404 });
  const res = await fetch(`${ENV.siteUrl}/partners/${file}.svg`).catch(() => null);
  if (!res || !res.ok) return new Response("Not found", { status: 404 });
  let svg = await res.text();

  const m = svg.match(/<g id="logo" data-box="([\d.]+),([\d.]+),([\d.]+),([\d.]+)" data-logo="(\w+)">[\s\S]*?<\/g>/);
  if (m) {
    const uri = await dataUri(LOGOS[m[5]] || LOGOS.white);
    if (uri) {
      const [, x, y, w, h] = m;
      svg = svg.replace(m[0], `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMinYMid meet" href="${uri}"/>`);
    }
  }
  if (!svg.includes("xmlns:xlink")) svg = svg.replace("<svg ", '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
