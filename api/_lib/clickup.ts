import crypto from "node:crypto";
import { ENV, has, log } from "./env.js";
import type { Lead } from "./types.js";

/** Tag linking a task to a client's email, so the portal can find their orders. */
export const clientTag = (email: string) =>
  "client-" + crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);

/** Client-facing title; the full task name is "<title> — <client> (<ref>)". */
export const taskTitle = (name: string) => name.split(" — ")[0];

const API = "https://api.clickup.com/api/v2";

async function cu(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: ENV.clickupToken, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`ClickUp ${path} ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

const PRIORITY: Record<string, number> = { asap: 2, "1-3m": 3, exploring: 4 };

export async function createLeadTask(
  lead: Lead,
  extras: { paymentUrl?: string; priceLabel?: string; tags?: string[]; details?: [string, string][]; title?: string },
) {
  if (!has.clickup()) return null;
  const lines = [
    `**Ref:** ${lead.ref}`,
    `**Name:** ${lead.name}`,
    `**Email:** ${lead.email}`,
    lead.company && `**Company:** ${lead.company}`,
    lead.phone && `**Phone:** ${lead.phone}`,
    lead.country && `**Country:** ${lead.country}`,
    `**Services:** ${lead.services.join(", ") || "Not specified"}`,
    lead.packageName && `**Package:** ${lead.packageName}${extras.priceLabel ? ` (${extras.priceLabel})` : ""}`,
    lead.timeline && `**Timeline:** ${lead.timeline}`,
    ...(extras.details || []).filter(([, v]) => v).map(([k, v]) => `**${k}:** ${v}`),
    extras.paymentUrl && `**Payment link sent:** ${extras.paymentUrl}`,
    lead.source && `**Source:** ${lead.source}`,
    lead.page && `**Form page:** ${lead.page}`,
    "",
    "### Message",
    lead.message,
  ].filter((l): l is string => typeof l === "string");

  const timelineKey = lead.timeline?.includes("soon") ? "asap" : lead.timeline?.includes("1–3") ? "1-3m" : lead.timeline ? "exploring" : "";
  const task = await cu(`/list/${ENV.clickupListId}/task`, {
    method: "POST",
    body: JSON.stringify({
      name: `${extras.title || lead.packageName || lead.services[0] || "Project request"} — ${lead.name}${lead.company ? ` (${lead.company})` : ""} (${lead.ref})`,
      markdown_description: lines.join("\n"),
      tags: [
        ...(extras.tags || ["website-lead"]),
        clientTag(lead.email),
        ...lead.services.map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 4),
      ],
      priority: PRIORITY[timelineKey] ?? 3,
    }),
  });
  log("clickup_task_created", { ref: lead.ref, id: task.id });
  return { id: task.id as string, url: (task.url as string) || `${ENV.clickupWorkspaceUrl}${task.id}` };
}

export async function commentOnTask(taskId: string | undefined, text: string) {
  if (!has.clickup() || !taskId) return;
  try {
    await cu(`/task/${taskId}/comment`, { method: "POST", body: JSON.stringify({ comment_text: text, notify_all: false }) });
  } catch (err) {
    log("clickup_comment_failed", { taskId, error: String(err) });
  }
}

export async function setTaskStatus(taskId: string | undefined, status: string) {
  if (!has.clickup() || !taskId || !status) return;
  try {
    await cu(`/task/${taskId}`, { method: "PUT", body: JSON.stringify({ status }) });
  } catch (err) {
    log("clickup_status_failed", { taskId, status, error: String(err) });
  }
}

export function taskUrl(taskId?: string) {
  return taskId ? `${ENV.clickupWorkspaceUrl}${taskId}` : undefined;
}

// ---------- Portal helpers ----------

export interface CuTask {
  id: string;
  name: string;
  status?: { status?: string };
  tags?: { name: string }[];
  date_created?: string;
  date_updated?: string;
  priority?: { priority?: string } | null;
  text_content?: string;
  markdown_description?: string;
  attachments?: { id: string; title?: string; url?: string; date?: string; size?: number; extension?: string }[];
}

/** All tasks for a client (open and closed), newest first. */
export async function listClientTasks(email: string): Promise<CuTask[]> {
  if (!has.clickup()) return [];
  const q = new URLSearchParams({ include_closed: "true", subtasks: "false", order_by: "created", reverse: "false" });
  q.append("tags[]", clientTag(email));
  const res = await cu(`/list/${ENV.clickupListId}/task?${q}`);
  return (res.tasks || []) as CuTask[];
}

export async function getTask(taskId: string): Promise<CuTask> {
  return cu(`/task/${encodeURIComponent(taskId)}?include_markdown_description=true`);
}

/** Only a task that carries this client's tag may be read or changed by them. */
export async function getClientTask(taskId: string, email: string): Promise<CuTask | null> {
  if (!has.clickup() || !/^[a-z0-9]+$/i.test(taskId)) return null;
  try {
    const t = await getTask(taskId);
    return (t.tags || []).some((x) => x.name === clientTag(email)) ? t : null;
  } catch {
    return null;
  }
}

export async function getComments(taskId: string): Promise<{ id: string; comment_text: string; date: string; user?: { username?: string; email?: string } }[]> {
  const res = await cu(`/task/${encodeURIComponent(taskId)}/comment`);
  return res.comments || [];
}

export async function addTag(taskId: string | undefined, tag: string) {
  if (!has.clickup() || !taskId) return;
  try { await cu(`/task/${taskId}/tag/${encodeURIComponent(tag)}`, { method: "POST" }); } catch (err) { log("clickup_tag_failed", { taskId, tag, error: String(err) }); }
}

export async function removeTag(taskId: string | undefined, tag: string) {
  if (!has.clickup() || !taskId) return;
  try { await cu(`/task/${taskId}/tag/${encodeURIComponent(tag)}`, { method: "DELETE" }); } catch (err) { log("clickup_untag_failed", { taskId, tag, error: String(err) }); }
}

/** Uploads a file to a task (ClickUp attachments). */
export async function uploadAttachment(taskId: string, file: Blob, filename: string) {
  const form = new FormData();
  form.append("attachment", file, filename);
  const res = await fetch(`${API}/task/${encodeURIComponent(taskId)}/attachment`, {
    method: "POST",
    headers: { Authorization: ENV.clickupToken },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`ClickUp attachment ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

/** Creates the ClickUp webhook that lets the portal email clients about replies and status changes. */
export async function createWebhook(endpoint: string) {
  const teams = await cu("/team");
  const teamId = teams.teams?.[0]?.id;
  if (!teamId) throw new Error("No ClickUp workspace found for this token");
  const existing = await cu(`/team/${teamId}/webhook`);
  for (const w of existing.webhooks || []) {
    if (w.endpoint === endpoint) await cu(`/webhook/${w.id}`, { method: "DELETE" });
  }
  return cu(`/team/${teamId}/webhook`, {
    method: "POST",
    body: JSON.stringify({ endpoint, events: ["taskCommentPosted", "taskStatusUpdated"], list_id: Number(ENV.clickupListId) || undefined }),
  });
}

/** Client email stored in the task description ("**Email:** x"). */
export function emailFromTask(t: CuTask): string | null {
  const m = `${t.markdown_description || ""}\n${t.text_content || ""}`.match(/Email:\**\s*([^\s*<>]+@[^\s*<>]+\.[a-z]{2,})/i);
  return m ? m[1].toLowerCase() : null;
}

/** Generic task in the leads list (support tickets etc.). Returns the new task id. */
export async function createTask(opts: { name: string; markdown: string; tags: string[]; priority?: number }) {
  if (!has.clickup()) return null;
  const task = await cu(`/list/${ENV.clickupListId}/task`, {
    method: "POST",
    body: JSON.stringify({ name: opts.name, markdown_description: opts.markdown, tags: opts.tags, priority: opts.priority ?? 3 }),
  });
  return { id: task.id as string, url: (task.url as string) || `${ENV.clickupWorkspaceUrl}${task.id}` };
}
