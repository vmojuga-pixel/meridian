import { randomHex, sha256Hex } from "./password.js";

const SESSION_TTL = 60 * 60 * 24; // 24h
const COOKIE_NAME = "__Host-meridian_session";

export async function createSession(env, userId, tenantId, request) {
  const token = randomHex(32);
  const csrf = randomHex(16);
  const tokenHash = await sha256Hex(token);
  const id = randomHex(16);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL;

  const ip = request.headers.get("CF-Connecting-IP") || null;
  const ua = request.headers.get("User-Agent") || null;

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, tenant_id, token_hash, csrf_token, ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, userId, tenantId, tokenHash, csrf, ip, ua, expiresAt).run();

  return { token, csrf, expiresAt, cookie: buildCookie(token, SESSION_TTL) };
}

export function buildCookie(token, maxAge) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function getSessionToken(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getSession(env, request) {
  const token = getSessionToken(request);
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const now = Math.floor(Date.now() / 1000);

  const row = await env.DB.prepare(
    "SELECT s.id, s.user_id, s.tenant_id, s.csrf_token, s.expires_at, u.email, u.role, u.email_verified FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(tokenHash, now).first();

  if (!row) return null;

  return {
    sessionId: row.id,
    userId: row.user_id,
    tenantId: row.tenant_id,
    csrfToken: row.csrf_token,
    email: row.email,
    role: row.role,
    emailVerified: row.email_verified === 1,
  };
}

export async function destroySession(env, sessionId) {
  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

export async function cleanupSessions(env) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
}
