# Paid Ads Setup: Google, YouTube, Facebook, Instagram, LinkedIn

The site is now ready for paid traffic. Every lead, booked call and contact click is
reported to GA4 and, once you add your IDs, to Google Ads, Meta and LinkedIn.
Each lead also records the campaign it came from.

## 1. Add your tracking IDs (one file)

Open `src/lib/ads.ts` and fill in what you use. Anything left empty simply doesn't load.

| Setting | Where to find it |
|---|---|
| `googleAdsId`, `googleAdsLeadLabel`, `googleAdsBookingLabel` | Google Ads → Goals → Conversions → New → Website. Create **Lead** and **Booked call** conversions → "Use Google tag" → copy `AW-…` and each label. This also covers **YouTube** campaigns. |
| `metaPixelId` | Meta Events Manager → Data sources → your pixel (covers **Facebook + Instagram**). |
| `linkedInPartnerId`, `linkedInLeadConversionId`, `linkedInBookingConversionId` | LinkedIn Campaign Manager → Analyze → Insight Tag (partner ID); Conversions → create Lead / Booked call (conversion IDs). |

Then redeploy.

## 2. What fires, and when

| Visitor action | GA4 | Google Ads | Meta | LinkedIn |
|---|---|---|---|---|
| Views any page | page_view | (tag) | PageView | (Insight Tag) |
| Views a landing page | page_view | | ViewContent | |
| Submits the quote form | `generate_lead` | Lead conversion | `Lead` | Lead conversion |
| Books a Calendly call | `generate_lead` (calendly) | Booked-call conversion | `Schedule` | Booked-call conversion |
| Clicks email / phone | email_click / phone_click | | `Contact` | |

After a successful form submission, visitors land on **`/thank-you`**. You can also set it as a URL-based conversion in any platform. Don't enable both JS and URL conversions for the same goal, or leads will double count.

## 3. Landing pages: use these as your ad URLs

Distraction-free pages with no main menu. Each has the form above the fold with the service pre-selected, starting prices, FAQ and call booking:

| Campaign | Final URL |
|---|---|
| Cloud consulting / migration | `/lp/cloud-consulting` |
| Managed hosting | `/lp/managed-hosting` |
| Web development | `/lp/web-development` |
| Mobile apps | `/lp/mobile-app-development` |
| Branding | `/lp/branding` |
| Digital marketing | `/lp/digital-marketing` |

They are `noindex` and not in the sitemap, so they don't compete with your main pages on Google. Edit the copy in `src/lib/landing.ts`.

**Always add UTM tags** so every lead shows its source. For example:

```
https://www.egowebservices.com/lp/cloud-consulting?utm_source=linkedin&utm_medium=paid_social&utm_campaign=cloud-migration-q4&utm_content=video-15s
```

- Google Ads (auto-tagging adds `gclid`): `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}`
- YouTube: `utm_source=youtube&utm_medium=video&utm_campaign=…`
- Meta (URL parameters field): `utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
- LinkedIn: `utm_source=linkedin&utm_medium=paid_social&utm_campaign=…`

## 4. Where to see the source of each lead

- **MailerLite**: the message field starts with a line like
  `[Service: IT Consulting & Cloud] [Package: Cloud Migration] [Source: source=linkedin, medium=paid_social, campaign=cloud-q4, click=li_fat_id, landing=/lp/cloud-consulting]`
- **Calendly**: bookings carry the UTM values (visible in the booking details and Calendly reports).
- **GA4**: Reports → Acquisition, filtered by the `generate_lead` event.

## 5. Privacy & consent (required by all ad platforms)

- New **Privacy Policy** (`/privacy`) and **Terms of Use** (`/terms`) pages, linked in the footer. Have your attorney review them.
- **Cookie consent**: visitors in Europe see an Accept/Decline banner, and ad pixels only load after they accept. Everyone can change their choice via "Cookie preferences" in the footer.
- **Google Consent Mode v2** is configured. It is required to keep running Google Ads to EEA/UK audiences.
- Add the privacy policy URL in Meta Business settings, LinkedIn Lead Gen and Google Ads where asked.

## 6. Before you spend

1. Add the IDs above and redeploy.
2. Click through one landing page from a tagged URL and submit a test lead. Check:
   - Meta Events Manager → Test events shows `Lead`.
   - Google Ads Tag Assistant shows the conversion.
   - LinkedIn Insight Tag status is "Active".
3. In GA4 mark `generate_lead` as a Key Event and link GA4 to Google Ads.
4. Fill in `phone` in `src/lib/site.ts` if you take calls. Click-to-call converts well on mobile ads.
5. Consider making Company/Phone/Country optional in MailerLite. Shorter forms convert noticeably better from social ads.
