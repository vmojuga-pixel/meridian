import { generateSecret, verifyTOTP, otpauthURI, generateRecoveryCodes } from "../auth/totp.js";
import { sha256Hex, randomHex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handle2FASetup(request, env, session) {
  const secret = generateSecret();
  const uri = otpauthURI(secret, session.email, "Meridian");
  await env.KV.put(`2fa:setup:${session.userId}`, secret, { expirationTtl: 600 });
  await logAuth(env, "2fa_setup_started", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request),
  });
  return Response.json({ ok: true, secret, uri });
}

export async function handle2FAVerify(request, env, session) {
  const { token } = await request.json();
  if (!token || token.length !== 6) return Response.json({ error: "Invalid token" }, { status: 400 });

  const secret = await env.KV.get(`2fa:setup:${session.userId}`);
  if (!secret) return Response.json({ error: "Setup not started" }, { status: 400 });

  const ok = await verifyTOTP(secret, token);
  if (!ok) return Response.json({ error: "Invalid code" }, { status: 400 });

  const codes = generateRecoveryCodes(8);
  const hashes = await Promise.all(codes.map(c => sha256Hex(c)));

  await env.DB.prepare(
    "UPDATE users SET totp_secret = ?, totp_enabled = 1, totp_verified_at = unixepoch(), recovery_codes = ? WHERE id = ?"
  ).bind(secret, JSON.stringify(hashes), session.userId).run();

  await env.KV.delete(`2fa:setup:${session.userId}`);
  await logAuth(env, "2fa_enabled", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request),
  });

  return Response.json({ ok: true, recovery_codes: codes });
}

export async function handle2FADisable(request, env, session) {
  const { token } = await request.json();
  const user = await env.DB.prepare("SELECT totp_secret FROM users WHERE id = ?").bind(session.userId).first();
  if (!user || !user.totp_secret) return Response.json({ error: "2FA not enabled" }, { status: 400 });

  const ok = await verifyTOTP(user.totp_secret, token);
  if (!ok) return Response.json({ error: "Invalid code" }, { status: 400 });

  await env.DB.prepare(
    "UPDATE users SET totp_secret = NULL, totp_enabled = 0, recovery_codes = NULL WHERE id = ?"
  ).bind(session.userId).run();

  await logAuth(env, "2fa_disabled", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request),
  });
  return Response.json({ ok: true });
}

export async function handle2FAStatus(request, env, session) {
  const user = await env.DB.prepare(
    "SELECT totp_enabled, totp_verified_at FROM users WHERE id = ?"
  ).bind(session.userId).first();
  return Response.json({
    enabled: !!(user && user.totp_enabled === 1),
    verified_at: user ? user.totp_verified_at : null,
  });
}

export async function verify2FAChallenge(env, userId, token) {
  const user = await env.DB.prepare(
    "SELECT totp_secret, recovery_codes FROM users WHERE id = ?"
  ).bind(userId).first();
  if (!user || !user.totp_secret) return false;

  if (await verifyTOTP(user.totp_secret, token)) return true;

  // Recovery code path
  if (token.length === 11 && token.includes("-")) {
    const hash = await sha256Hex(token.toUpperCase());
    const codes = JSON.parse(user.recovery_codes || "[]");
    if (codes.includes(hash)) {
      const filtered = codes.filter(c => c !== hash);
      await env.DB.prepare("UPDATE users SET recovery_codes = ? WHERE id = ?")
        .bind(JSON.stringify(filtered), userId).run();
      return true;
    }
  }
  return false;
}
