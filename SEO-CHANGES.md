# SEO & Lead-Conversion Update

Same theme, same design system, same integrations (MailerLite, Calendly, Tawk.to, GA4).
Deploys to Vercel exactly as before (`yarn build`, output `dist/public`).

## Before you deploy: 2 settings to review in `src/lib/site.ts`

- `phone`: empty by default. Add a public number (e.g. `"+16145550100"`, with
  `phoneDisplay: "(614) 555-0100"`) and click-to-call appears in the header,
  contact page, footer and sticky mobile bar automatically.
- `responseTime`: set to `"1 business day"`. It appears next to quote buttons and
  in the form success message. Change it to whatever you can reliably meet.

## SEO

| Problem | Fix |
|---|---|
| Every URL returned an empty `<div id="root">` with the Replit placeholder description | Build now prerenders each route to real HTML (`scripts/prerender.mjs`) with its own title, description, canonical, Open Graph and content. React hydrates it, so the site behaves the same. |
| Unknown URLs returned 200 (soft 404s) | `vercel.json` uses `cleanUrls`; unknown URLs get `404.html` with a real 404 status and `noindex`. |
| No sitemap, robots.txt didn't reference one | `sitemap.xml` is generated at build; robots.txt points to it. |
| No structured data | `ProfessionalService`/`LocalBusiness` schema with address, prices and social profiles; `BreadcrumbList` on inner pages; `FAQPage` on Home and Pricing. |
| Titles duplicated the brand ("Contact Us \| EGO Web Services \| EGO Web Services") | All titles/descriptions live in `src/lib/site.ts` and get the brand once. Rewritten to target "web development / hosting Columbus OH". |
| twitter:description still the Replit placeholder; no share image | Fixed everywhere; new `public/og-image.jpg` (1200×630) in your brand colours. |
| Stat counters showed "0" until scrolled (what crawlers and link previews saw) | Final values are in the HTML; they still count up on scroll. |
| Font loaded via render-blocking CSS `@import` plus an unused Inter font | Plus Jakarta Sans now loads via `<link>` with preconnect; Inter removed. Same look, faster first paint. |
| `maximum-scale=1` blocked pinch-zoom | Removed (accessibility + Lighthouse). |
| Images had no dimensions or lazy loading | Added `width`/`height`, `loading="lazy"`, `decoding="async"`. |
| H1 had no keywords | "Web development & hosting built for substance, not hype." keeps your voice and adds the terms people search. |
| Footer had no address | Name/address/email block added (local SEO consistency with schema). |

## Lead conversion & UX

- **Hero**: "Since 2016" badge, clearer subhead, secondary CTA now goes to Pricing, trust line under the buttons (free quote, reply time, fixed pricing).
- **Stats**: "1M+ Projects Deployed" sat next to "11+ Active Clients" and read as inconsistent. Replaced with "24/7 Support & Monitoring" on Home and About. Revert in `Home.tsx` / `About.tsx` if you prefer.
- **Home**: new "Getting started is simple" 3-step section and FAQ; service tabs now have a direct "Get a Free Quote" button; final CTA adds "Book a 30-min Call".
- **Contact form**:
  - "What do you need help with?" service chips. Pricing and service buttons pre-select them (`/contact?service=web-dev&package=Starter%20Website`).
  - The choice is added to the top of the Message, e.g. `[Service: Web Development] [Package: Starter Website]`. It arrives in MailerLite with no change to your MailerLite form.
  - Two-column layout on desktop, form shown first on mobile, proper labels and autofill, phone keypad on mobile.
  - "Get My Free Quote" button, privacy reassurance line, better success message with a "Book a call" link.
- **Contact page**: trust bullets, "Prefer to talk? Book a 30-minute call" jump link, "What happens next" steps.
- **Pricing**: tabs are deep-linkable (`/pricing#web-dev`); "Get Started" passes the chosen package to the form; FAQ added; recommended card no longer overflows on phones.
- **Services**: each service links to its quote form (pre-selected) and its pricing tab; section anchors land below the fixed header.
- **Sticky mobile CTA bar** after the hero (hidden on /contact). The Tawk.to bubble is lifted so they don't overlap.
- **Navigation**: pages now open at the top (they used to keep the previous scroll position), and `/services#…` links scroll to the right section.
- **404 page**: on-brand, with links to key pages and a quote CTA (was a developer placeholder).
- **Support page**:
  - The ticket form only logged to the browser console, so tickets reached no one. It now opens a pre-filled email to support@.
  - "Live Chat" opens the Tawk.to chat.
  - The dead "Browse Library" button now requests documentation by email.
- **Analytics** (GA4):
  - `generate_lead` fires on quote form success, Calendly booking and support ticket.
  - `cta_click`, `email_click` and `phone_click` are tracked too.
  - Page views now record the correct page title.
  - In GA4 → Admin → Events, mark `generate_lead` as a Key Event.

## Needs your input (not changed)

- **Portfolio case studies & testimonials**: names like "Global Tech Solutions" / "Sarah Jenkins, CTO, DataNexus" with stock photos read as placeholders. If they're real, add logos/links/photos. If not, replace them with real ones; unverifiable testimonials can hurt trust and carry FTC risk. They are deliberately **not** marked up as reviews in structured data.
- **MailerLite**: Company, Phone and Country are still required because they're required in your MailerLite form. Making Company and Phone optional there (then removing `required` in `MailerLiteContactForm.tsx`) usually lifts completions.

## After deploying

1. Vercel → Domains: make `www.egowebservices.com` primary and 301 the bare domain to it.
2. Google Search Console: submit `https://www.egowebservices.com/sitemap.xml`; URL-inspect `/` and `/contact`.
3. Bing Webmaster Tools: import from Search Console.
4. Check share previews: LinkedIn Post Inspector, Facebook Sharing Debugger.
5. Google Rich Results Test on `/` and `/pricing`.
6. Create or claim the Google Business Profile for 1496 Old Henderson Rd and link it in `BUSINESS.social`.

## How the build works now

`yarn build` runs three steps:
1. `vite build`: client bundle, as before.
2. `vite build --ssr src/entry-server.tsx`: a small server bundle used only at build time.
3. `node scripts/prerender.mjs`: writes `index.html`, `services.html`, … `404.html` and `sitemap.xml` into `dist/public`.

No server, environment variables or extra dependencies are needed. `yarn dev` works exactly as before.
