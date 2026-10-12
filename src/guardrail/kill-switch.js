import { CONFIG } from "../config.js";

export async function isKilled(env, tenantId) {
  const global = await env.KV.get(CONFIG.KILL_SWITCH_KEY);
  if (global === "true") return true;
  const tenant = await env.KV.get(`kill:${tenantId}`);
  if (tenant === "true") return true;
  return false;
}

export async function handleKillSwitch(request, env) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenant");
  const adminKey = request.headers.get("X-Admin-Key");

  if (adminKey !== env.ADMIN_KEY) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const enabled = body.enabled === true;

  const key = tenantId ? `kill:${tenantId}` : CONFIG.KILL_SWITCH_KEY;
  await env.KV.put(key, enabled ? "true" : "false");

  return Response.json({ ok: true, key, enabled });
}
