# Lead → ClickUp → Slack → Email → Stripe automation

Runs as Vercel serverless functions inside this repo (`/api`). The MailerLite form is unchanged: after MailerLite accepts a submission, the page also sends the details to `/api/lead`.

## What happens

| When | Automatically |
|---|---|
| Someone submits the contact form | ClickUp task created (priority from their timeline) · confirmation email to the client from **notifications@** · Slack message in your leads channel · **full copy to info@** |
| They picked a **fixed-price package** (Cloud Readiness Assessment $2,000 · Basic Hosting $9/mo · Performance VPS $45/mo · Dedicated Server $150/mo · Logo Design $950 · Complete Brand $2,800) | No approval: the visitor is **taken straight to Stripe payment** after submitting. They also get an **AI-written** email from notifications@ ("request received, here's what you'll get") with the payment button. Slack shows "auto-handled". |
| Anything else (custom work, quotes) | An **AI-drafted reply** appears in Slack (and in the info@ copy) with **Send reply** and **Edit, add price & send**. A person reviews and sends it. In the info@ email you can also press Reply (it goes to the client) or "Open reply in my mail app". |
| You click **Send reply** | Draft emailed to the client · ClickUp comment (+ status) · Slack message marked "sent" |
| You click **Edit, add price & send** | Edit the text, optionally enter an amount (one-time or monthly). A Stripe payment link for that amount is created and added to the email. |
| The client pays | ClickUp comment (+ "paid" status) · Slack 💰 alert · **AI-written** "payment received + what happens next" email from notifications@ (e.g. hosting: access details and DNS settings are coming) · copy to info@ · client lands on `/thank-you?paid=1` |

Each piece switches on when its keys are present, so you can set up one at a time. Only Stripe is used. The PayPal account is suspended, so it's left out. (Its address, `admin@egowebserivces.com`, also looks misspelled: "serivces".)

## Setup (about 30 minutes)

Add every value below in **Vercel → Project → Settings → Environment Variables** (Production). `.env.example` lists them all. Redeploy after adding.

### 1. Email (Resend)
1. Create an account at resend.com → **Domains** → add `egowebservices.com` → add the DNS records it shows (SPF/DKIM) at your DNS host → wait for "Verified".
2. **API Keys** → create one with "Sending access" → `RESEND_API_KEY`.
3. Senders: automatic emails come from `notifications@egowebservices.com` and replies a person sends from Slack come from `EMAIL_FROM` (hello@). Any address on the verified domain works, no mailbox needed. Client replies go to `EMAIL_REPLY_TO` (info@).
4. `TEAM_NOTIFY_EMAIL` (default `info@egowebservices.com`) gets a copy of every lead, order and payment, including the AI reply draft.

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

### 5. AI (drafts and fixed-package emails)
console.anthropic.com → API key → `ANTHROPIC_API_KEY`, and make sure the account has credit (Plans & Billing). Without it, everything still works with well-written templates instead of AI text. The AI only uses facts from `NEXT_STEPS` in `api/_lib/ai.ts` for "what you'll get", so edit that list if your onboarding changes.

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


---

# Buy now + client portal

## Buy now (fixed-price packages)
Hosting (Shared $9 · VPS $45 · Dedicated $150 /month), Logo Design ($950), Complete Brand ($2,800) and the Cloud Readiness Assessment ($2,000) now have a **Buy now** button (Pricing, Services, cloud pages, ad landing pages).

1. The client fills a short order form at `/checkout` (contact details + package-specific details: domain for hosting, brand name/brief for design, current setup for the assessment).
2. A ClickUp task is created (tags `order`, `awaiting-payment`) and Slack gets 🛒 **New order … awaiting payment**.
3. The client pays on Stripe Checkout (cards, receipts and invoices handled by Stripe; hosting is a monthly subscription).
4. When Stripe confirms: the task gets the `paid` tag (and `CLICKUP_STATUS_PAID` if set), Slack gets 💰, the client gets a "Payment received" email with a link to the portal.

Until Stripe keys are added, Buy now quietly falls back to a normal lead (Slack + ClickUp + confirmation email), so no order is lost.

**Stripe restricted key**: in addition to Products, Prices, Payment Links and Checkout Sessions (Write), give it **Customers (Read)** and **Customer portal (Write)** for the portal's Billing button.

**Stripe customer portal (one time)**: Stripe → Settings → Billing → **Customer portal** → turn on invoices history, payment method updates and subscription cancellation → Save.

## Client portal (portal.egowebservices.com)
Clients sign in with a one-time email link (no passwords) and see:
- **Orders**: every order/request made with their email, with its stage (Received → In progress → In review → Delivered) taken from the ClickUp status.
- **Messages**: they can write to you (→ ClickUp comment + Slack). You reply by writing a ClickUp comment that starts with **`To client:`**; they get it by email and in the portal. Other comments stay internal.
- **Files**: upload up to 4 MB per file (stored as ClickUp attachments); files you attach to the task are visible to them too.
- **Billing**: invoices, receipts, cards and subscriptions via Stripe's secure customer portal.

ClickUp status → what the client sees: `to do`/`open` → Received · `in progress` → In progress · anything with `review` → In review · `complete`/`closed`/`done` → Delivered. Moving a task to In progress, In review or Delivered emails the client automatically.

### Setup (about 10 minutes)
1. **Secret**: generate a long random string (Git Bash: `openssl rand -hex 32`) and add it in Vercel as `PORTAL_SECRET`.
2. **Subdomain**: Vercel → website-main → Settings → **Domains** → Add `portal.egowebservices.com`. Add the DNS record Vercel shows (a `CNAME` for `portal` → `cname.vercel-dns.com`) where your DNS is managed. (Until then, the portal also works at `www.egowebservices.com/portal` if you set `PORTAL_URL=https://www.egowebservices.com`.)
3. **Redeploy**.
4. **ClickUp notifications**: open `https://www.egowebservices.com/api/clickup?action=setup&key=YOUR_PORTAL_SECRET` once. It creates the ClickUp webhook and shows a secret. Add that as `CLICKUP_WEBHOOK_SECRET` in Vercel and **Redeploy** again.
5. Test: open portal.egowebservices.com, sign in with an email that has an order, send a message, upload a file; in ClickUp reply with `To client: Hello!`.

Security: sign-in links expire after 20 minutes; sessions last 30 days in an HttpOnly cookie; clients can only open tasks tagged with their own email; cross-site requests are blocked; uploads are size- and type-limited.

---

# Client portal: Services, Support and Documents

The portal now has four tabs: **Orders · Services · Support · Documents**. Everything is stored in ClickUp (no extra database) and Stripe.

## Services (hosting: cPanel / WHM, Plesk, VMs, managed cloud)
- A hosting order becomes a **service** automatically once it's paid. At checkout the client picks the control panel (cPanel / WHM, Plesk, or no panel = VM with root/SSH), which sets the tag `svc-cpanel`, `svc-plesk` or `svc-vm`.
- To add a service by hand (e.g. managed cloud or a VM you sold by quote): on the client's task add the tags `service` and one of `svc-cpanel`, `svc-plesk`, `svc-vm`, `svc-cloud`.
- The client sees the price, the renewal date and the status live from Stripe (**Active**, **Setting up**, **Payment due**, **Cancels at period end**, **Cancelled**), plus buttons: Open control panel · Get help · Upgrade plan · Messages & files · Cancel.

### Giving the client their access details
Post a ClickUp **comment** on the service task that starts with `Service details:`. Use one `Label: value` per line. The client gets an email ("Your … is ready") and sees the details in the portal. The newest comment wins, so post a new one to update.

cPanel / WHM:
```
Service details:
Control panel: https://server1.egowebservices.com:2083
Username: acme
Server IP: 203.0.113.10
Nameservers: ns1.egowebservices.com, ns2.egowebservices.com
Webmail: https://server1.egowebservices.com:2096
Password: sent separately
```
Plesk:
```
Service details:
Control panel: https://server2.egowebservices.com:8443
Username: acme
Server IP: 203.0.113.11
Nameservers: ns1.egowebservices.com, ns2.egowebservices.com
Password: sent separately
```
VM (no panel):
```
Service details:
Server IP: 203.0.113.20
SSH: ssh acme@203.0.113.20 (port 22)
Operating system: Ubuntu 24.04 LTS
Plan: 4 vCPU · 8 GB RAM · 160 GB NVMe
Region: Frankfurt
Password: SSH key, sent separately
```
- Lines whose label contains *password, secret, token, key* or *PIN* are **always** shown as "Sent to you separately", whatever you write. Still, never put real passwords in ClickUp: send them by a one-time secret link (e.g. onetimesecret.com) or let the client set their own.
- The first line with a link (e.g. `Control panel: https://…`) becomes the **Open control panel** button.
- Lines without a `Label:` are shown as notes (e.g. "SSL is active.").

## Support
- Clients open requests from **Support → New request** (or **Get help** on a service), with a topic, a priority (Normal · High · Urgent) and a description. Each request is a ClickUp task tagged `support` (+ `urgent`), linked to the service, with reference `SUP-…`.
- You get a Slack alert (🔴 for urgent) and a copy at info@. The client gets a confirmation from notifications@.
- Reply with a ClickUp comment starting `To client:`; the client gets it by email and in the portal. Ticket stages follow the task status: to do → **Open**, in progress → **In progress**, review → **Waiting on you**, complete → **Resolved** (the client is emailed on each change).
- **Upgrade plan** opens a request with the topic "Upgrade or change plan". Change the plan in Stripe (Customers → subscription → Update) and reply to the client.

## Documents
Every file attached to any of the client's tasks (orders, services, tickets) is listed in **Documents**, marked **From EGO** or **Uploaded by you**. To share a report or deliverable, attach it to the client's task in ClickUp.

## Requirements
- Stripe key permissions: add **Subscriptions: Read** (and Products: Read) so the portal can show plans and renewal dates.
- Stripe → Settings → Billing → **Customer portal**: cancellations on (the portal's Cancel button opens Stripe's cancel page).
- The **"service ready"**, **reply** and **status** emails need the ClickUp webhook: open `https://www.egowebservices.com/api/clickup?action=setup&key=YOUR_PORTAL_SECRET` once and save the secret it shows as `CLICKUP_WEBHOOK_SECRET` in Vercel, then redeploy.
