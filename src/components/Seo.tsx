import { useEffect } from "react";
import { PAGES, OG_IMAGE, canonicalUrl, fullTitle, pageJsonLd } from "@/lib/site";

interface SeoProps {
  /** Route key in PAGES (src/lib/site.ts), e.g. "/contact". */
  path: keyof typeof PAGES | string;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps <head> in sync on client-side navigation. The same values are baked
 * into each page's static HTML at build time by scripts/prerender.mjs, so
 * crawlers and link previews get them without running JavaScript.
 */
export function Seo({ path }: SeoProps) {
  useEffect(() => {
    const page = PAGES[path] ?? PAGES["/404"];
    const title = fullTitle(page.title);
    const url = page.noindex ? null : canonicalUrl(page.path);

    document.title = title;
    setMeta("name", "description", page.description);
    setMeta("name", "robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", page.description);
    setMeta("name", "twitter:image", OG_IMAGE);
    if (url) setMeta("property", "og:url", url);
    setLink("canonical", url);

    document.head.querySelectorAll("script[data-page-ld]").forEach((s) => s.remove());
    for (const obj of pageJsonLd(page)) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-page-ld", "");
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }
  }, [path]);

  return null;
}
