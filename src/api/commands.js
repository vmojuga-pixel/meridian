import { callTenant } from "../tenant/router.js";

export async function handleCommands(request, env, tenantId) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  const body = await request.json();

  // Manual command -> bypass rules engine, but still respect guardrails
  await env.DB.prepare(
    "INSERT INTO commands (tenant_id, machine_id, action, value, reason, rule_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    tenantId,
    body.machine_id,
    body.action,
    body.value ?? null,
    "manual",
    null
  ).run();

  return Response.json({ ok: true, accepted: body });
}
