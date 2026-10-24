# Deploying to Vercel

This project is a static Vite + React site and is ready to deploy as-is.

## Option A — Vercel dashboard (recommended)
1. Push this folder to a GitHub repo (or upload it directly in the Vercel dashboard).
2. In Vercel, click **Add New → Project** and import the repo.
3. Vercel will auto-detect the settings from `vercel.json`:
   - Install command: `yarn install --frozen-lockfile`
   - Build command: `yarn build`
   - Output directory: `dist/public`
4. Click **Deploy**.

## Option B — Vercel CLI
```bash
npm i -g vercel
cd ego-web-services   # this folder
vercel                # first deploy, follow the prompts
vercel --prod         # promote to production
```

## Why Yarn instead of npm or pnpm?
Two different package managers hit unrelated bugs on Vercel's build image for
this project:
- `pnpm install` intermittently failed with `ERR_INVALID_THIS` while fetching
  package metadata.
- `npm ci`/`npm install` failed with `npm error Exit handler never called!`
  (a known bug in the npm CLI itself), regardless of which Node/npm version
  was used.

Switching to Yarn Classic (`yarn.lock` is included) avoided both issues in
testing, so that's what this project deploys with. `package.json` also pins
`"engines": { "node": "24.x" }` since Vercel deprecated Node 20 as of late
2026.

## Notes
- No environment variables are required — the site has no backend/API calls.
- Every route is prerendered to its own HTML file at build time
  (`scripts/prerender.mjs`), and `vercel.json` uses `cleanUrls`, so `/pricing` or
  `/contact` load real HTML on direct load and refresh, and unknown URLs return a
  proper 404 page. When you add a new page, add its route to `PAGES` in
  `src/lib/site.ts` so it is prerendered and listed in the sitemap.
- See `SEO-CHANGES.md` for the SEO / conversion changes and post-deploy checklist.
- The live chat widget (Tawk.to), booking widget (Calendly), and the two
  newsletter/contact forms (MailerLite) all point at the same accounts/IDs used
  on the current site, so submissions will land in the same places after you
  deploy.
- To use a custom domain, add it under the Vercel project's **Settings → Domains**
  and update DNS as instructed there.
