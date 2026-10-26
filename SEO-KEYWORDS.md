# Keyword map: EGO Web Services

Positioning: **Google Cloud Partner serving businesses worldwide**, delivering cloud consulting and migration
on Google Cloud, AWS and Azure, plus managed hosting and web development.

Each keyword cluster has **one** page that owns it, so pages don't compete with each other.
The title, H1, intro, FAQ and structured data of each page are written for its cluster.

| Page | Primary keywords | Secondary / long-tail |
|---|---|---|
| `/` Home | google cloud partner, cloud consulting company | cloud migration company, managed hosting, web development company |
| `/google-cloud` | google cloud partner, google cloud consulting, gcp consulting services | google cloud migration services, migrate to google cloud, GKE consulting, BigQuery consulting, google cloud cost optimization, RaMP google cloud |
| `/cloud-migration` | cloud migration services, cloud migration company | migrate servers to cloud, data center migration, cloud readiness assessment, cloud migration cost |
| `/managed-cloud` | managed cloud services, cloud cost optimization | cloud monitoring 24/7, reduce cloud bill, FinOps services, managed kubernetes |
| `/aws` | aws consulting services, aws migration | aws cost optimization, aws architecture review, managed aws |
| `/azure` | azure consulting services, azure migration | microsoft azure partner (only once confirmed), migrate windows server to azure, azure cost optimization |
| `/services` | IT services company, digital agency | branding, mobile app development, digital marketing |
| `/cloud-regions` | cloud data residency, multi-region cloud architecture | cloud regions by country, GDPR data location, choose cloud region |
| `/pricing` | cloud migration cost, website development cost, managed hosting price | cloud assessment price, web development pricing |

## Partnership wording rules (important)

- **Google Cloud:** "Google Cloud Partner" is used site-wide (plain text). Google only allows its
  **official badge** to be used under the Partner Advantage guidelines. Download it from the
  Partner Advantage portal, save it to `public/badges/` and set `PARTNERS.googleCloudBadge` in
  `src/lib/site.ts`. It will then replace the text pill everywhere.
  Don't add Google's logo from other sources.
- **AWS / Azure:** pages describe services only, with no partner claims. When a partnership is confirmed:
  1. Set `PARTNERS.aws` / `PARTNERS.azure` to `true`.
  2. Update the copy in `src/lib/cloud.ts` (eyebrow, FAQ) to say "AWS Partner" / "Microsoft Partner".
  3. Use only the badge each program provides.

## Next SEO steps (off-site, highest impact)

1. **Google Cloud Partner directory:** complete your profile in Partner Advantage so you appear in
   Google's partner finder, and link it to `https://www.egowebservices.com/google-cloud`. It's a strong,
   relevant backlink.
2. **Google Business Profile (for brand searches and reviews):**
   - Primary category: "Computer consultant" or "Internet marketing service".
   - Secondary categories: "Website designer", "Computer support and services".
   - Mention "Google Cloud Partner" in the description.
3. **Directories with backlinks:** Clutch, GoodFirms, G2 (Google consulting category), DesignRush, the Google Cloud Partner directory.
4. **Content (one article a month):** each one targets a long-tail question and links to the matching service page. Examples:
   - "How much does a cloud migration cost?"
   - "Google Cloud vs AWS for small business"
   - "What is Google Cloud RaMP?"
   - "Moving from on-premises servers to Google Cloud"
5. **Reviews:** ask each client for a Google review that mentions the service ("migrated us to Google Cloud…").
6. **Search Console:** after 4–6 weeks, check which queries each page gets impressions for, and
   refine titles and FAQs toward the queries that are close to page 1.
