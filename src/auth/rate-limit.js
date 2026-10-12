export async function checkRateLimit(env, key, max, windowSec) {
  const now = Math.floor(Date.now() / 1000);
  const k = `rl:auth:${key}`;
  const raw = await env.KV.get(k, "json");

  if (!raw) {
    await env.KV.put(k, JSON.stringify({ count: 1, start: now }), { expirationTtl: windowSec });
    return { ok: true, remaining: max - 1 };
  }

  if (now - raw.start > windowSec) {
    await env.KV.put(k, JSON.stringify({ count: 1, start: now }), { expirationTtl: windowSec });
    return { ok: true, remaining: max - 1 };
  }

  if (raw.count >= max) {
    return { ok: false, retryAfter: windowSec - (now - raw.start) };
  }

  await env.KV.put(k, JSON.stringify({ count: raw.count + 1, start: raw.start }), { expirationTtl: windowSec });
  return { ok: true, remaining: max - raw.count - 1 };
}
