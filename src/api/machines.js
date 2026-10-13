import { randomHex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";
import { checkPlanLimit } from "./billing.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleMachinesList(request, env, session) {
  const rows = await env.DB.prepare(
    "SELECT id, name, brand, model, protocol, serial, status, created_at FROM machines WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(session.tenantId).all();
  return Response.json({ machines: rows.results || [] });
}

export async function handleMachineCreate(request, env, session) {
  const body = await request.json();
  const { name, brand, model, protocol, serial } = body;
  if (!name || name.length < 2) return Response.json({ error: "Machine name required" }, { status: 400 });

  const limit = await checkPlanLimit(env, session.tenantId, "machine");
  if (!limit.ok) return Response.json({ error: limit.error, plan: limit.plan }, { status: 402 });

  const id = "m_" + randomHex(8);
  await env.DB.prepare(
    "INSERT INTO machines (id, tenant_id, name, brand, model, protocol, serial, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'offline')"
  ).bind(id, session.tenantId, name, brand || null, model || null, protocol || null, serial || null).run();

  await logAuth(env, "machine_created", {
    userId: session.userId,
    tenantId: session.tenantId,
    ip: ip(request),
    ua: ua(request),
    meta: { machine_id: id, name },
  });

  return Response.json({ ok: true, machine: { id, name, brand, model, protocol, serial, status: "offline" } }, { status: 201 });
}

export async function handleMachineDelete(request, env, session, machineId) {
  const row = await env.DB.prepare(
    "SELECT id FROM machines WHERE id = ? AND tenant_id = ?"
  ).bind(machineId, session.tenantId).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM machines WHERE id = ? AND tenant_id = ?").bind(machineId, session.tenantId).run();
  await logAuth(env, "machine_deleted", {
    userId: session.userId,
    tenantId: session.tenantId,
    ip: ip(request),
    ua: ua(request),
    meta: { machine_id: machineId },
  });
  return Response.json({ ok: true });
}
