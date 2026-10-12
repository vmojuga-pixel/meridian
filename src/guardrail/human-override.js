export async function isHumanOverride(env, tenantId, machineId) {
  const key = `override:${tenantId}:${machineId}`;
  const v = await env.KV.get(key);
  return v === "true";
}

export async function setHumanOverride(env, tenantId, machineId, enabled) {
  const key = `override:${tenantId}:${machineId}`;
  await env.KV.put(key, enabled ? "true" : "false");
  return { ok: true, key, enabled };
}
