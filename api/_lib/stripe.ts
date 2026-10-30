import crypto from "node:crypto";
import { ENV, has, log } from "./env.js";

const API = "https://api.stripe.com/v1";

/** Stripe REST call with form encoding (no SDK needed). */
async function stripe(path: string, params?: Record<string, string | number | boolean | undefined>, method = "POST") {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== "") body.append(k, String(v));
  const url = method === "GET" && params ? `${API}${path}?${body}` : `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${ENV.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: method === "GET" ? undefined : body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path} ${res.status}: ${json?.error?.message || "error"}`);
  return json;
}

interface PriceSpec {
  lookupKey: string;
  productName: string;
  amountCents: number;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
}

/** Finds the Stripe price for a package by lookup key, creating it the first time. */
async function ensurePrice(spec: PriceSpec): Promise<string> {
  const found = await stripe("/prices", { "lookup_keys[]": spec.lookupKey, active: true, limit: 1 }, "GET");
  if (found.data?.[0]?.id) return found.data[0].id;
  const created = await stripe("/prices", {
    currency: ENV.currency,
    unit_amount: spec.amountCents,
    lookup_key: spec.lookupKey,
    "product_data[name]": spec.productName,
    ...(spec.mode === "subscription" ? { "recurring[interval]": spec.interval || "month" } : {}),
  });
  log("stripe_price_created", { lookupKey: spec.lookupKey, id: created.id });
  return created.id;
}

export interface PaymentLinkInput {
  ref: string;
  email: string;
  productName: string;
  amountCents: number;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
  lookupKey?: string; // set for catalog packages so prices are reused
  clickupTaskId?: string;
}

/** Creates a single-use Stripe Payment Link for a lead and returns its URL (email pre-filled). */
export async function createPaymentLink(input: PaymentLinkInput): Promise<string | null> {
  if (!has.stripe()) return null;
  const price = await ensurePrice({
    lookupKey: input.lookupKey || `ego_custom_${input.ref.toLowerCase()}_${input.mode}_${input.amountCents}`,
    productName: input.productName,
    amountCents: input.amountCents,
    mode: input.mode,
    interval: input.interval,
  });
  const meta: Record<string, string> = { ref: input.ref, client_email: input.email };
  if (input.clickupTaskId) meta.clickup_task_id = input.clickupTaskId;
  const params: Record<string, string | number | boolean> = {
    "line_items[0][price]": price,
    "line_items[0][quantity]": 1,
    allow_promotion_codes: true,
    "after_completion[type]": "redirect",
    "after_completion[redirect][url]": `${ENV.siteUrl}/thank-you?paid=1&ref=${encodeURIComponent(input.ref)}`,
    "restrictions[completed_sessions][limit]": 1,
  };
  for (const [k, v] of Object.entries(meta)) {
    params[`metadata[${k}]`] = v;
    params[input.mode === "subscription" ? `subscription_data[metadata][${k}]` : `payment_intent_data[metadata][${k}]`] = v;
  }
  if (input.mode === "payment") {
    params.customer_creation = "always";
    params["invoice_creation[enabled]"] = true;
  }
  const link = await stripe("/payment_links", params);
  log("stripe_payment_link_created", { ref: input.ref, id: link.id });
  return `${link.url}?prefilled_email=${encodeURIComponent(input.email)}`;
}

export interface CheckoutInput extends PaymentLinkInput {
  successUrl: string;
  cancelUrl: string;
}

/** Stripe Checkout for a "Buy now" order. Returns the hosted checkout URL. */
export async function createCheckoutSession(input: CheckoutInput): Promise<string> {
  const price = await ensurePrice({
    lookupKey: input.lookupKey || `ego_custom_${input.ref.toLowerCase()}_${input.mode}_${input.amountCents}`,
    productName: input.productName,
    amountCents: input.amountCents,
    mode: input.mode,
    interval: input.interval,
  });
  const meta: Record<string, string> = { ref: input.ref, client_email: input.email, source: "buy_now" };
  if (input.clickupTaskId) meta.clickup_task_id = input.clickupTaskId;
  const params: Record<string, string | number | boolean> = {
    mode: input.mode,
    "line_items[0][price]": price,
    "line_items[0][quantity]": 1,
    customer_email: input.email,
    client_reference_id: input.ref,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };
  for (const [k, v] of Object.entries(meta)) {
    params[`metadata[${k}]`] = v;
    params[input.mode === "subscription" ? `subscription_data[metadata][${k}]` : `payment_intent_data[metadata][${k}]`] = v;
  }
  if (input.mode === "payment") {
    params.customer_creation = "always";
    params["invoice_creation[enabled]"] = true;
  }
  const session = await stripe("/checkout/sessions", params);
  log("stripe_checkout_created", { ref: input.ref, id: session.id });
  return session.url as string;
}

/** Stripe customer for an email (created by checkout / payment links). */
export async function findCustomerId(email: string): Promise<string | null> {
  if (!has.stripe()) return null;
  const res = await stripe("/customers", { email: email.toLowerCase(), limit: 1 }, "GET");
  if (res.data?.[0]?.id) return res.data[0].id;
  const res2 = await stripe("/customers", { email, limit: 1 }, "GET");
  return res2.data?.[0]?.id || null;
}

/** Stripe-hosted billing page: invoices, payment methods, subscriptions. */
export async function billingPortalUrl(customerId: string, returnUrl: string): Promise<string> {
  const s = await stripe("/billing_portal/sessions", { customer: customerId, return_url: returnUrl });
  return s.url as string;
}

export interface SubscriptionInfo {
  id: string;
  status: string; // active, past_due, canceled, trialing, unpaid, incomplete…
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null; // ms
  amount: string; // "$45/month"
  product: string;
  taskId?: string;
  ref?: string;
}

/** A customer's subscriptions (all statuses), newest first. Needs Subscriptions + Products read. */
export async function listSubscriptions(customerId: string): Promise<SubscriptionInfo[]> {
  const res = await stripe("/subscriptions", { customer: customerId, status: "all", limit: 30, "expand[]": "data.items.data.price.product" }, "GET");
  return (res.data || []).map((sub: any) => {
    const item = sub.items?.data?.[0];
    const price = item?.price || {};
    const interval = price.recurring?.interval || "month";
    return {
      id: sub.id,
      status: sub.status,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      currentPeriodEnd: (sub.current_period_end || item?.current_period_end) ? (sub.current_period_end || item.current_period_end) * 1000 : null,
      amount: `${formatMoney(price.unit_amount || 0, price.currency || ENV.currency)}/${interval}`,
      product: (typeof price.product === "object" ? price.product?.name : "") || "Subscription",
      taskId: sub.metadata?.clickup_task_id,
      ref: sub.metadata?.ref,
    } as SubscriptionInfo;
  });
}

/** Billing-portal link that opens straight on "cancel this subscription" (falls back to the normal billing page). */
export async function cancelSubscriptionUrl(customerId: string, subscriptionId: string, returnUrl: string): Promise<string> {
  try {
    const s = await stripe("/billing_portal/sessions", {
      customer: customerId,
      return_url: returnUrl,
      "flow_data[type]": "subscription_cancel",
      "flow_data[subscription_cancel][subscription]": subscriptionId,
    });
    return s.url as string;
  } catch (err) {
    log("stripe_cancel_flow_failed", { error: String(err) });
    return billingPortalUrl(customerId, returnUrl);
  }
}

export async function getPaymentLinkMetadata(id: string): Promise<Record<string, string>> {
  try {
    const link = await stripe(`/payment_links/${id}`, undefined, "GET");
    return link.metadata || {};
  } catch {
    return {};
  }
}

/** Verifies a Stripe webhook signature (Stripe-Signature header) against the raw body. */
export function verifyStripeSignature(rawBody: string, header: string | null, toleranceSec = 300): boolean {
  if (!header || !ENV.stripeWebhookSecret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", ENV.stripeWebhookSecret).update(`${t}.${rawBody}`).digest("hex");
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

export function formatMoney(cents: number, currency = ENV.currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}
