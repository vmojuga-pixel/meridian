import { randomHex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleTemplatesList(request, env) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const q = category
    ? env.DB.prepare("SELECT id, name, category, description, config, installs, author FROM rule_templates WHERE category = ? ORDER BY installs DESC").bind(category)
    : env.DB.prepare("SELECT id, name, category, description, config, installs, author FROM rule_templates ORDER BY installs DESC");
  const rows = await q.all();
  return Response.json({ templates: rows.results || [] });
}

export async function handleTemplateInstall(request, env, session, templateId) {
  const tpl = await env.DB.prepare(
    "SELECT id, name, config FROM rule_templates WHERE id = ?"
  ).bind(templateId).first();
  if (!tpl) return Response.json({ error: "Template not found" }, { status: 404 });

  const ruleId = "r_" + randomHex(8);
  await env.DB.prepare(
    "INSERT INTO rules (id, tenant_id, name, config, enabled) VALUES (?, ?, ?, ?, 1)"
  ).bind(ruleId, session.tenantId, tpl.name, tpl.config).run();

  await env.DB.prepare(
    "UPDATE rule_templates SET installs = installs + 1 WHERE id = ?"
  ).bind(templateId).run();

  await logAuth(env, "template_installed", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { template_id: templateId, rule_id: ruleId },
  });

  return Response.json({ ok: true, rule_id: ruleId }, { status: 201 });
}
