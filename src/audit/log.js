export async function logAudit(env, entry) {
  const record = {
    ts: Math.floor(Date.now() / 1000),
    ...entry,
  };

  // Primary: D1 (structured)
  try {
    await env.DB.prepare(
      "INSERT INTO commands (tenant_id, machine_id, action, value, reason, rule_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      record.tenant_id,
      record.machine_id,
      "audit",
      null,
      JSON.stringify(record.actions ?? []),
      null
    ).run();
  } catch (e) {
    console.error("audit D1 failed:", e.message);
  }

  // Secondary: R2 (immutable, append-only)
  try {
    const date = new Date().toISOString().slice(0, 10);
    const key = `audit/${record.tenant_id}/${date}/${record.ts}-${crypto.randomUUID()}.json`;
    await env.AUDIT.put(key, JSON.stringify(record));
  } catch (e) {
    console.error("audit R2 failed:", e.message);
  }
}
