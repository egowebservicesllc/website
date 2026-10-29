/**
 * Configuration for the lead → ClickUp → Slack → email → Stripe automation.
 * Every value comes from Vercel → Project → Settings → Environment Variables
 * (see AUTOMATION-SETUP.md and .env.example). Missing services are skipped,
 * so you can switch the pieces on one at a time.
 */
const e = (k: string, d = "") => (process.env[k] ?? d).trim();

export const ENV = {
  siteUrl: e("SITE_URL", "https://www.egowebservices.com"),
  portalUrl: e("PORTAL_URL", "https://portal.egowebservices.com"),
  portalSecret: e("PORTAL_SECRET"), // long random string; signs portal sign-in links and sessions
  allowedOrigins: e("ALLOWED_ORIGINS", "https://www.egowebservices.com,https://egowebservices.com,https://portal.egowebservices.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // ClickUp
  clickupToken: e("CLICKUP_API_TOKEN"),
  clickupListId: e("CLICKUP_LIST_ID"),
  clickupStatusReplied: e("CLICKUP_STATUS_REPLIED"), // e.g. "contacted" (optional)
  clickupStatusPaid: e("CLICKUP_STATUS_PAID"), // e.g. "won" (optional)
  clickupWorkspaceUrl: e("CLICKUP_TASK_URL_BASE", "https://app.clickup.com/t/"),
  clickupWebhookSecret: e("CLICKUP_WEBHOOK_SECRET"), // from /api/clickup/setup; lets ClickUp notify clients

  // Slack
  slackBotToken: e("SLACK_BOT_TOKEN"),
  slackSigningSecret: e("SLACK_SIGNING_SECRET"),
  slackChannelId: e("SLACK_CHANNEL_ID"),

  // Email (Resend)
  resendApiKey: e("RESEND_API_KEY"),
  emailFrom: e("EMAIL_FROM", "EGO Web Services <hello@egowebservices.com>"),
  emailReplyTo: e("EMAIL_REPLY_TO", "info@egowebservices.com"),
  internalNotifyEmail: e("INTERNAL_NOTIFY_EMAIL"), // optional copy of every lead
  signatureName: e("SIGNATURE_NAME", "The EGO Web Services team"),
  calendlyUrl: e("CALENDLY_URL", "https://calendly.com/egowebservices/30min"),
  responseTime: e("RESPONSE_TIME", "1 business day"),

  // Stripe
  stripeSecretKey: e("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: e("STRIPE_WEBHOOK_SECRET"),
  currency: e("STRIPE_CURRENCY", "usd"),

  // AI drafts (Anthropic)
  anthropicApiKey: e("ANTHROPIC_API_KEY"),
  anthropicModel: e("ANTHROPIC_MODEL", "claude-sonnet-5-5"),
};

export const has = {
  clickup: () => Boolean(ENV.clickupToken && ENV.clickupListId),
  slack: () => Boolean(ENV.slackBotToken && ENV.slackChannelId),
  email: () => Boolean(ENV.resendApiKey),
  stripe: () => Boolean(ENV.stripeSecretKey),
  portal: () => Boolean(ENV.portalSecret && ENV.portalSecret.length >= 16),
  ai: () => Boolean(ENV.anthropicApiKey),
};

export function log(event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ...data }));
}
