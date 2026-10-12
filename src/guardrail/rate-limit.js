import { CONFIG } from "../config.js";

export async function checkRateLimit(env, tenantId, machineId) {
  const key = `rl:${tenantId}:${machineId}`;
  const last = await env.KV.get(key);
  const now = Date.now();

  if (last) {
    const elapsed = now - parseInt(last, 10);
    if (elapsed < CONFIG.RATE_LIMIT_MS) {
      return false;
    }
  }

  await env.KV.put(key, String(now), { expirationTtl: 60 });
  return true;
}
