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
