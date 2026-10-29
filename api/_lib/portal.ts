/**
 * Client portal helpers: signed magic-link / session tokens (no database),
 * cookie handling, and turning ClickUp tasks into client-friendly orders.
 */
import crypto from "node:crypto";
import { ENV } from "./env.js";
import { taskTitle, type CuTask } from "./clickup.js";

const COOKIE = "ego_portal";
const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

interface TokenBody { e: string; typ: "login" | "session"; exp: number }

export function signToken(email: string, typ: TokenBody["typ"], ttlSec: number) {
  const body = b64(JSON.stringify({ e: email.toLowerCase(), typ, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  const sig = b64(crypto.createHmac("sha256", ENV.portalSecret).update(`${typ}.${body}`).digest());
  return `${body}.${sig}`;
}

export function verifyToken(token: string | null | undefined, typ: TokenBody["typ"]): string | null {
  if (!token || !ENV.portalSecret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64(crypto.createHmac("sha256", ENV.portalSecret).update(`${typ}.${body}`).digest());
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenBody;
    if (data.typ !== typ || data.exp < Date.now() / 1000) return null;
    return data.e;
  } catch {
    return null;
  }
}

export const SESSION_DAYS = 30;

export function sessionCookie(email: string) {
  const token = signToken(email, "session", SESSION_DAYS * 86400);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export function sessionEmail(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return verifyToken(m?.[1], "session");
}

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });

/** Same-site requests only (blocks cross-site form posts to cookie-authenticated endpoints). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin GETs don't always send it
  try {
    const host = new URL(origin).hostname;
    return ENV.allowedOrigins.includes(origin) || host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

// ---------- Orders ----------

export const STAGES = ["Received", "In progress", "In review", "Delivered"] as const;

export function stageOf(status?: string): number {
  const s = (status || "").toLowerCase();
  if (/complete|closed|done|deliver/.test(s)) return 3;
  if (/review/.test(s)) return 2;
  if (/progress|active|doing|working/.test(s)) return 1;
  return 0;
}

export function refOf(name: string) {
  return name.match(/EGO-\d{6}-[A-Z0-9]{4}/)?.[0] || "";
}

export function orderSummary(t: CuTask) {
  const tags = (t.tags || []).map((x) => x.name);
  const stage = stageOf(t.status?.status);
  return {
    id: t.id,
    title: taskTitle(t.name),
    ref: refOf(t.name),
    stage,
    stageLabel: STAGES[stage],
    payment: tags.includes("awaiting-payment") ? "awaiting" : tags.includes("paid") ? "paid" : null,
    isOrder: tags.includes("order"),
    created: Number(t.date_created) || null,
    updated: Number(t.date_updated) || null,
  };
}

/** Comments the client should see: their own messages and the team's replies. */
export function clientMessages(comments: { id: string; comment_text: string; date: string }[]) {
  const out: { id: string; from: "client" | "team"; text: string; date: number }[] = [];
  for (const c of comments) {
    const t = (c.comment_text || "").trim();
    if (t.startsWith("💬 Client message:")) out.push({ id: c.id, from: "client", text: t.replace(/^💬 Client message:\s*/, ""), date: Number(c.date) });
    else if (/^to client:/i.test(t)) out.push({ id: c.id, from: "team", text: t.replace(/^to client:\s*/i, ""), date: Number(c.date) });
    else if (t.startsWith("✉️ Reply emailed to")) {
      const body = t.split(/\n\s*\n/).slice(1).join("\n\n").trim();
      if (body) out.push({ id: c.id, from: "team", text: body, date: Number(c.date) });
    }
  }
  return out.sort((a, b) => a.date - b.date);
}

// Simple in-memory rate limiter (per warm function instance).
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}
export const clientIp = (r: Request) => (r.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
