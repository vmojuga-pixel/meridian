import { askMeri } from "./advisor.js";

export async function handleMeriChat(request, env, tenantId) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  const { message } = await request.json();
  if (!message) {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  const summary = await getTenantSummary(env, tenantId);
  const result = await askMeri(env, summary, message);

  return Response.json(result);
}

async function getTenantSummary(env, tenantId) {
  const [alerts, commands, machines] = await Promise.all([
    env.DB.prepare(
      "SELECT severity, COUNT(*) as n FROM alerts WHERE tenant_id = ? AND resolved = 0 GROUP BY severity"
    ).bind(tenantId).all(),
    env.DB.prepare(
      "SELECT COUNT(*) as n FROM commands WHERE tenant_id = ? AND ts > unixepoch() - 86400"
    ).bind(tenantId).first(),
    env.DB.prepare(
      "SELECT COUNT(DISTINCT machine_id) as n FROM telemetry_agg WHERE tenant_id = ?"
    ).bind(tenantId).first(),
  ]);

  return {
    tenant: tenantId,
    alerts: alerts.results || [],
    commands_24h: commands?.n ?? 0,
    machines: machines?.n ?? 0,
  };
}
