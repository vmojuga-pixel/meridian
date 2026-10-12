import { randomHex, sha256Hex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleApiKeyList(request, env, session) {
  const rows = await env.DB.prepare(
    "SELECT id, name, scope, last_used, revoked, created_at FROM api_keys WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(session.tenantId).all();
  return Response.json({ keys: rows.results || [] });
}

export async function handleApiKeyCreate(request, env, session) {
  const { name, scope } = await request.json();
  if (!name || name.length < 2) return Response.json({ error: "Name required" }, { status: 400 });

  const allowedScopes = ["ingest:write", "ingest:read"];
  const finalScope = allowedScopes.includes(scope) ? scope : "ingest:write";

  const raw = "mk_" + randomHex(24);
  const keyHash = await sha256Hex(raw);
  const id = "k_" + randomHex(8);

  await env.DB.prepare(
    "INSERT INTO api_keys (id, tenant_id, name, key_hash, scope) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, session.tenantId, name, keyHash, finalScope).run();

  await logAuth(env, "apikey_created", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { key_id: id, name, scope: finalScope },
  });

  return Response.json({
    ok: true,
    key: { id, name, scope: finalScope, key: raw },
    warning: "Store this key now. It will not be shown again.",
  }, { status: 201 });
}

export async function handleApiKeyRevoke(request, env, session, keyId) {
  const row = await env.DB.prepare(
    "SELECT id FROM api_keys WHERE id = ? AND tenant_id = ?"
  ).bind(keyId, session.tenantId).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare("UPDATE api_keys SET revoked = 1 WHERE id = ?").bind(keyId).run();
  await logAuth(env, "apikey_revoked", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { key_id: keyId },
  });
  return Response.json({ ok: true });
}

export async function verifyApiKey(env, rawKey, requiredScope) {
  if (!rawKey || !rawKey.startsWith("mk_")) return null;
  const hash = await sha256Hex(rawKey);
  const row = await env.DB.prepare(
    "SELECT id, tenant_id, scope, revoked FROM api_keys WHERE key_hash = ?"
  ).bind(hash).first();
  if (!row || row.revoked === 1) return null;
  if (requiredScope && !row.scope.split(":").includes(requiredScope.split(":")[0])) return null;
  await env.DB.prepare("UPDATE api_keys SET last_used = unixepoch() WHERE id = ?").bind(row.id).run();
  return { keyId: row.id, tenantId: row.tenant_id, scope: row.scope };
}
