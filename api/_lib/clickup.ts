import { ENV, has, log } from "./env.js";
import type { Lead } from "./types.js";

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

export async function createLeadTask(lead: Lead, extras: { paymentUrl?: string; priceLabel?: string }) {
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
      name: `${lead.name}${lead.company ? ` (${lead.company})` : ""}: ${lead.services[0] || "New request"}`,
      markdown_description: lines.join("\n"),
      tags: ["website-lead", ...lead.services.map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 4)],
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
