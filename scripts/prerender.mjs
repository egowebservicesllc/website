/**
 * Build-time prerender (runs after `vite build` + `vite build --ssr`).
 *
 * Before: every URL returned the same empty <div id="root"> with the Replit
 * placeholder description, so Bing, LinkedIn, WhatsApp, Facebook and AI
 * crawlers saw no content and Google had to render JS to see anything.
 *
 * After: each route gets its own static HTML file with the full page markup,
 * its own <title>, description, canonical, Open Graph and JSON-LD. React then
 * hydrates that markup in the browser, so the site behaves exactly as before.
 *
 * Output (dist/public):
 *   index.html, services.html, pricing.html, ... 404.html, sitemap.xml
 * vercel.json uses `cleanUrls`, so /pricing serves pricing.html, and unknown
 * URLs get 404.html with a real 404 status instead of a soft-404.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "dist/public");
const serverEntry = path.join(root, "dist/server/entry-server.js");

const { render, PAGES, INDEXABLE_ROUTES, PRERENDER_ROUTES, renderHeadTags, SITE_URL } = await import(
  pathToFileURL(serverEntry).href
);

const template = await fs.readFile(path.join(outDir, "index.html"), "utf8");
if (!template.includes("<!--seo:start-->") || !template.includes("<!--app-html-->")) {
  throw new Error("index.html is missing the <!--seo:start--> / <!--app-html--> markers");
}

const routes = PRERENDER_ROUTES;
for (const route of routes) {
  const page = PAGES[route];
  const appHtml = render(route === "/404" ? "/this-page-does-not-exist" : route);
  const html = template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, renderHeadTags(page))
    .replace("<!--app-html-->", appHtml);

  const file = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  await fs.mkdir(path.dirname(path.join(outDir, file)), { recursive: true });
  await fs.writeFile(path.join(outDir, file), html);
  console.log(`prerendered ${route.padEnd(11)} -> ${file} (${(html.length / 1024).toFixed(0)} kB)`);
}

const today = new Date().toISOString().slice(0, 10);
const priority = { "/": "1.0", "/services": "0.9", "/pricing": "0.9", "/contact": "0.8" };
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${INDEXABLE_ROUTES.map(
  (r) =>
    `  <url><loc>${r === "/" ? `${SITE_URL}/` : SITE_URL + r}</loc><lastmod>${today}</lastmod><priority>${priority[r] ?? "0.6"}</priority></url>`,
).join("\n")}
</urlset>
`;
await fs.writeFile(path.join(outDir, "sitemap.xml"), sitemap);
console.log(`sitemap.xml with ${INDEXABLE_ROUTES.length} URLs`);
