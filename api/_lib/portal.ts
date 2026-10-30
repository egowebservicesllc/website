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
  return name.match(/(?:EGO|SUP)-\d{6}-[A-Z0-9]{4}/)?.[0] || "";
}

/** Support tickets use their own stage names (same ClickUp statuses). */
export const TICKET_STAGES = ["Open", "In progress", "Waiting on you", "Resolved"] as const;

export type TaskKind = "order" | "service" | "ticket" | "request";
const tagNames = (t: CuTask) => (t.tags || []).map((x) => x.name);

export function kindOf(t: CuTask): TaskKind {
  const tags = tagNames(t);
  if (tags.includes("support")) return "ticket";
  if (tags.includes("service") && !tags.includes("awaiting-payment")) return "service";
  if (tags.includes("order")) return "order";
  return "request";
}

/** Hosting platform from tags: svc-cpanel, svc-plesk, svc-vm, svc-cloud (default: hosting). */
export function platformOf(t: CuTask): "cpanel" | "plesk" | "vm" | "cloud" | "hosting" {
  const tags = tagNames(t);
  if (tags.includes("svc-cpanel")) return "cpanel";
  if (tags.includes("svc-plesk")) return "plesk";
  if (tags.includes("svc-vm")) return "vm";
  if (tags.includes("svc-cloud")) return "cloud";
  return "hosting";
}

/** Tags for a hosting order from the "Control panel" choice at checkout. */
export function platformTag(choice?: string) {
  const c = (choice || "").toLowerCase();
  if (c.includes("cpanel")) return "svc-cpanel";
  if (c.includes("plesk")) return "svc-plesk";
  if (c.includes("no control panel") || c.includes("vm") || c.includes("root")) return "svc-vm";
  return "svc-hosting";
}

const SECRET_KEY = /pass(word)?|secret|token|private\s*key|api\s*key|pin\b/i;

/**
 * The team posts access details as a ClickUp comment:
 *   Service details:
 *   Control panel: https://server1.example.com:2083
 *   Username: acme
 * The newest such comment wins. Secret-looking lines are never shown.
 */
export function serviceDetails(comments: { comment_text: string; date: string }[]) {
  const c = [...comments]
    .filter((x) => /^\s*service details\s*:/i.test(x.comment_text || ""))
    .sort((a, b) => Number(b.date) - Number(a.date))[0];
  if (!c) return null;
  const items: { label: string; value: string; link?: string; hidden?: boolean }[] = [];
  const notes: string[] = [];
  for (const raw of c.comment_text.replace(/^\s*service details\s*:/i, "").split("\n")) {
    const line = raw.trim().replace(/^[-*•]\s*/, "");
    if (!line) continue;
    const m = line.match(/^([^:]{1,40}):\s*(.+)$/);
    if (!m || /^https?$/i.test(m[1].trim())) { notes.push(line.slice(0, 500)); continue; }
    const label = m[1].trim();
    const value = m[2].trim().slice(0, 500);
    if (SECRET_KEY.test(label)) { items.push({ label, value: "Sent to you separately", hidden: true }); continue; }
    const link = value.match(/^https?:\/\/\S+$/)?.[0];
    items.push({ label, value, ...(link ? { link } : {}) });
  }
  return { items: items.slice(0, 30), notes: notes.slice(0, 10), updated: Number(c.date) || null };
}

/** Ticket fields stored in the task description ("**Priority:** Urgent"). */
export function ticketInfo(t: CuTask) {
  const d = `${t.markdown_description || ""}\n${t.text_content || ""}`;
  const get = (k: string) => d.match(new RegExp(`${k}:\\**\\s*([^\\n*]+)`, "i"))?.[1]?.trim();
  return { category: get("Category") || "Support", priority: get("Priority") || "Normal", serviceId: get("Service ID") || undefined };
}

export function orderSummary(t: CuTask) {
  const tags = (t.tags || []).map((x) => x.name);
  const stage = stageOf(t.status?.status);
  const kind = kindOf(t);
  return {
    id: t.id,
    kind,
    title: taskTitle(t.name).replace(/^Support:\s*/i, ""),
    ref: refOf(t.name),
    stage,
    stageLabel: kind === "ticket" ? TICKET_STAGES[stage] : STAGES[stage],
    ...(kind === "ticket" ? { ticket: ticketInfo(t) } : {}),
    ...(kind === "service" ? { platform: platformOf(t) } : {}),
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
