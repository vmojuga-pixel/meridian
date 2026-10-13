import { randomHex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleRulesList(request, env, session) {
  const rows = await env.DB.prepare(
    "SELECT id, name, config, enabled, created_at FROM rules WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(session.tenantId).all();
  return Response.json({ rules: rows.results || [] });
}

export async function handleRuleCreate(request, env, session) {
  const body = await request.json();
  const { name, metric, operator, threshold, action, action_value, severity } = body;
  if (!name || name.length < 2) return Response.json({ error: "Name required" }, { status: 400 });
  if (!metric) return Response.json({ error: "Metric required" }, { status: 400 });
  if (!operator) return Response.json({ error: "Operator required" }, { status: 400 });
  if (threshold === undefined || threshold === null) return Response.json({ error: "Threshold required" }, { status: 400 });

  const validOps = ["gt", "gte", "lt", "lte", "eq", "neq"];
  if (!validOps.includes(operator)) return Response.json({ error: "Invalid operator" }, { status: 400 });

  const validMetrics = ["temp", "rpm", "power"];
  if (!validMetrics.includes(metric)) return Response.json({ error: "Invalid metric" }, { status: 400 });

  const validActions = ["alert", "command", "clear"];
  const act = validActions.includes(action) ? action : "alert";
  const sev = ["info", "warning", "critical"].includes(severity) ? severity : "warning";

  const id = "r_" + randomHex(8);
  const config = JSON.stringify({ metric, operator, threshold: Number(threshold), action: act, action_value: action_value ?? null, severity: sev });

  await env.DB.prepare(
    "INSERT INTO rules (id, tenant_id, name, config, enabled) VALUES (?, ?, ?, ?, 1)"
  ).bind(id, session.tenantId, name, config).run();

  await logAuth(env, "rule_created", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { rule_id: id, name },
  });

  return Response.json({ ok: true, rule: { id, name, config: JSON.parse(config), enabled: 1 } }, { status: 201 });
}

export async function handleRuleUpdate(request, env, session, ruleId) {
  const row = await env.DB.prepare(
    "SELECT id FROM rules WHERE id = ? AND tenant_id = ?"
  ).bind(ruleId, session.tenantId).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (typeof body.enabled === "boolean") {
    await env.DB.prepare("UPDATE rules SET enabled = ? WHERE id = ?")
      .bind(body.enabled ? 1 : 0, ruleId).run();
  }
  await logAuth(env, "rule_updated", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { rule_id: ruleId },
  });
  return Response.json({ ok: true });
}

export async function handleRuleDelete(request, env, session, ruleId) {
  const row = await env.DB.prepare(
    "SELECT id FROM rules WHERE id = ? AND tenant_id = ?"
  ).bind(ruleId, session.tenantId).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM rules WHERE id = ? AND tenant_id = ?")
    .bind(ruleId, session.tenantId).run();
  await logAuth(env, "rule_deleted", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { rule_id: ruleId },
  });
  return Response.json({ ok: true });
}

export async function loadTenantRules(env, tenantId) {
  const rows = await env.DB.prepare(
    "SELECT id, name, config, enabled FROM rules WHERE tenant_id = ? AND enabled = 1"
  ).bind(tenantId).all();
  return (rows.results || []).map(r => ({ id: r.id, name: r.name, ...JSON.parse(r.config) }));
}
