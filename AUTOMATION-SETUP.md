# Lead → ClickUp → Slack → Email → Stripe automation

Runs as Vercel serverless functions inside this repo (`/api`). The MailerLite form is unchanged: after MailerLite accepts a submission, the page also sends the details to `/api/lead`.

## What happens

| When | Automatically |
|---|---|
| Someone submits the contact form | ClickUp task created (priority from their timeline) · branded confirmation email sent to the client · Slack message in your leads channel |
| They picked a **fixed-price package** (Cloud Readiness Assessment $2,000 · Basic Hosting $9/mo · Performance VPS $45/mo · Dedicated Server $150/mo · Logo Design $950 · Complete Brand $2,800) | A single-use Stripe payment link is created and included in the confirmation email. Slack shows "auto-handled". |
| Anything else (custom work) | An AI-drafted reply appears in Slack with **Send reply** and **Edit, add price & send** |
| You click **Send reply** | Draft emailed to the client · ClickUp comment (+ status) · Slack message marked "sent" |
| You click **Edit, add price & send** | Edit the text, optionally enter an amount (one-time or monthly). A Stripe payment link for that amount is created and added to the email. |
| The client pays | ClickUp comment (+ "paid" status) · Slack 💰 alert · "payment received" email with the kickoff-call link · client lands on `/thank-you?paid=1` |

Each piece switches on when its keys are present, so you can set up one at a time. Only Stripe is used. The PayPal account is suspended, so it's left out. (Its address, `admin@egowebserivces.com`, also looks misspelled: "serivces".)

## Setup (about 30 minutes)

Add every value below in **Vercel → Project → Settings → Environment Variables** (Production). `.env.example` lists them all. Redeploy after adding.

### 1. Email (Resend)
1. Create an account at resend.com → **Domains** → add `egowebservices.com` → add the DNS records it shows (SPF/DKIM) at your DNS host → wait for "Verified".
2. **API Keys** → create one with "Sending access" → `RESEND_API_KEY`.
3. Optional: `INTERNAL_NOTIFY_EMAIL=info@egowebservices.com` to BCC yourself on every confirmation.

### 2. ClickUp
1. Avatar → **Settings → Apps → API Token** → `CLICKUP_API_TOKEN`.
2. Open (or create) a list such as "Website Leads". The number at the end of its URL (`.../li/901234567`) → `CLICKUP_LIST_ID`.
3. Optional: add statuses like `contacted` and `won` to that list and set `CLICKUP_STATUS_REPLIED=contacted`, `CLICKUP_STATUS_PAID=won` (the names must match exactly).

### 3. Slack
1. api.slack.com/apps → **Create New App → From an app manifest** → pick your workspace → paste:

```yaml
display_information:
  name: EGO Leads
  description: Website leads, reply drafts and payments
features:
  bot_user:
    display_name: EGO Leads
    always_online: true
oauth_config:
  scopes:
    bot:
      - chat:write
      - channels:history
settings:
  interactivity:
    is_enabled: true
    request_url: https://www.egowebservices.com/api/slack/actions
  org_deploy_enabled: false
  socket_mode_enabled: false
```

2. **Install to Workspace** → copy the **Bot User OAuth Token** (`xoxb-…`) → `SLACK_BOT_TOKEN`.
3. **Basic Information → Signing Secret** → `SLACK_SIGNING_SECRET`.
4. In Slack create `#leads`, type `/invite @EGO Leads`, then open the channel details: the ID at the bottom (`C0…`) → `SLACK_CHANNEL_ID`.

Want the ClickUp side in Slack too? ClickUp's own Slack integration can post task updates in the same channel. It's optional; this automation already links each Slack message to its task.

### 4. Stripe (payments@egowebservices.com)
1. Dashboard → **Developers → API keys → Create restricted key** with **Write** on: *Products, Prices, Payment Links, Checkout Sessions*. Everything else stays None. → `STRIPE_SECRET_KEY` (`rk_live_…`).
2. **Developers → Webhooks → Add endpoint** `https://www.egowebservices.com/api/stripe/webhook`, events `checkout.session.completed` and `checkout.session.async_payment_succeeded` → copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
3. Prices are created in Stripe automatically the first time each package is ordered, so there's nothing to set up by hand. To change a package price, edit `src/lib/packages.ts` (and give the package a new name, or archive the old price in Stripe).
4. Tip: do a full run with test-mode keys (`rk_test_…`, test webhook secret) first, then swap in live keys.

### 5. AI drafts (optional)
console.anthropic.com → API key → `ANTHROPIC_API_KEY`. Without it, Slack still gets a sensible template draft.

## Testing it
1. Submit the contact form on the live site with your own email and a custom message → you get the confirmation; Slack shows the draft; ClickUp has the task.
2. Click **Edit, add price & send**, enter `1` → you receive the reply with a $1 payment link (test mode: card `4242 4242 4242 4242`).
3. Pay → Slack 💰, ClickUp comment, "payment received" email, `/thank-you?paid=1` page.
4. On the Pricing page, pick **Logo Design** → submit → the confirmation already has the payment button.

Problems? Vercel → Project → **Logs**, filtered to `/api`. Every step logs a JSON line (`lead_received`, `stripe_failed`, `slack_error`, …).

## Files
- `api/lead.ts`: form endpoint (validation, rate limits, orchestration)
- `api/slack/actions.ts`: Slack buttons and modal
- `api/stripe/webhook.ts`: payment confirmations
- `api/_lib/*`: ClickUp, Slack, Stripe, Resend, AI helpers and email templates
- `src/lib/packages.ts`: package catalog and fixed prices (shared with the Pricing page)
