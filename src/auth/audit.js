export async function logAuth(env, event, { userId, tenantId, ip, ua, meta } = {}) {
  try {
    await env.DB.prepare(
      "INSERT INTO audit_auth (user_id, tenant_id, event, ip, ua, meta) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      userId || null,
      tenantId || null,
      event,
      ip || null,
      ua || null,
      meta ? JSON.stringify(meta) : null
    ).run();
  } catch (e) {
    console.error("audit log failed:", e.message);
  }
}
