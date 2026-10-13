import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleTenantMe(request, env, session) {
  if (request.method === "GET") {
    const t = await env.DB.prepare(
      "SELECT id, name, factory_name, country, industry, default_protocol, onboarded, onboarded_at, created_at FROM tenants WHERE id = ?"
    ).bind(session.tenantId).first();
    return Response.json({ tenant: t || null });
  }

  if (request.method === "PUT") {
    const body = await request.json();
    const { factory_name, country, industry, default_protocol } = body;

    if (!factory_name || factory_name.length < 2) {
      return Response.json({ error: "Factory name required" }, { status: 400 });
    }

    await env.DB.prepare(
      "UPDATE tenants SET name = ?, factory_name = ?, country = ?, industry = ?, default_protocol = ? WHERE id = ?"
    ).bind(
      factory_name,
      factory_name,
      country || null,
      industry || null,
      default_protocol || "modbus",
      session.tenantId
    ).run();

    await logAuth(env, "tenant_updated", {
      userId: session.userId,
      tenantId: session.tenantId,
      ip: ip(request),
      ua: ua(request),
      meta: { factory_name, country, industry, default_protocol },
    });

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
