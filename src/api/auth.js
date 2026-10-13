import { validatePassword, validateEmail, hashPassword, verifyPassword, randomSalt, randomHex, sha256Hex } from "../auth/password.js";
import { createSession, destroySession, clearCookie, getSession } from "../auth/session.js";
import { checkRateLimit } from "../auth/rate-limit.js";
import { logAuth } from "../auth/audit.js";
import { sendVerifyEmail } from "../auth/email.js";
import { verify2FAChallenge } from "./2fa.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

export async function handleSignup(request, env) {
  const rate = await checkRateLimit(env, `signup:${ip(request)}`, 3, 3600);
  if (!rate.ok) return Response.json({ error: "Too many attempts" }, { status: 429 });

  const { email, password, factory_name, country, industry } = await request.json();

  const eErr = validateEmail(email);
  if (eErr) return Response.json({ error: eErr }, { status: 400 });
  const pErr = validatePassword(password);
  if (pErr) return Response.json({ error: pErr }, { status: 400 });
  if (!factory_name || factory_name.length < 2) return Response.json({ error: "Factory name required" }, { status: 400 });

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existing) return Response.json({ error: "Email already registered" }, { status: 409 });

  const tenantId = "t_" + randomHex(8);
  const userId = "u_" + randomHex(8);
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  const verifyToken = randomHex(24);

  await env.DB.prepare(
    "INSERT INTO tenants (id, name, api_key_hash) VALUES (?, ?, ?)"
  ).bind(tenantId, factory_name, "pending").run();

  await env.DB.prepare(
    "UPDATE tenants SET factory_name = ?, country = ?, industry = ?, onboarded = 0 WHERE id = ?"
  ).bind(factory_name, country || null, industry || null, tenantId).run();

  await env.DB.prepare(
    "INSERT INTO users (id, tenant_id, email, password_hash, salt, role, email_verified, verify_token) VALUES (?, ?, ?, ?, ?, 'owner', 0, ?)"
  ).bind(userId, tenantId, email.toLowerCase(), hash, salt, verifyToken).run();

  await logAuth(env, "signup", { userId, tenantId, ip: ip(request), ua: ua(request) });

  const origin = new URL(request.url).origin;
  const verifyUrl = origin + "/verify?token=" + verifyToken;
  const mail = await sendVerifyEmail(env, { to: email.toLowerCase(), factoryName: factory_name, verifyUrl });
  await logAuth(env, "verify_email_sent", { userId, tenantId, ip: ip(request), ua: ua(request), meta: { ok: mail.ok } });

  return Response.json({
    ok: true,
    message: "Account created. Check your email to verify.",
    email_sent: mail.ok,
  }, { status: 201 });
}

export async function handleVerify(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.json({ error: "Token required" }, { status: 400 });

  const user = await env.DB.prepare("SELECT id, tenant_id FROM users WHERE verify_token = ?").bind(token).first();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 400 });

  await env.DB.prepare("UPDATE users SET email_verified = 1, verify_token = NULL WHERE id = ?").bind(user.id).run();
  await logAuth(env, "email_verified", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });

  return Response.json({ ok: true, message: "Email verified. You can log in now." });
}

export async function handleLogin(request, env) {
  const rate = await checkRateLimit(env, `login:${ip(request)}`, 5, 900);
  if (!rate.ok) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: "Email and password required" }, { status: 400 });

  const user = await env.DB.prepare(
    "SELECT id, tenant_id, email, password_hash, salt, role, email_verified, failed_attempts, locked_until, totp_enabled FROM users WHERE email = ?"
  ).bind(email.toLowerCase()).first();

  const genericError = Response.json({ error: "Invalid credentials" }, { status: 401 });

  if (!user) {
    await logAuth(env, "login_failed", { ip: ip(request), ua: ua(request), meta: { email } });
    return genericError;
  }

  const now = Math.floor(Date.now() / 1000);
  if (user.locked_until && user.locked_until > now) {
    await logAuth(env, "login_locked", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });
    return Response.json({ error: "Account locked. Try again later." }, { status: 423 });
  }

  const ok = await verifyPassword(password, user.salt, user.password_hash);
  if (!ok) {
    const attempts = (user.failed_attempts || 0) + 1;
    const lockedUntil = attempts >= 10 ? now + 3600 : null;
    await env.DB.prepare("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?")
      .bind(attempts, lockedUntil, user.id).run();
    await logAuth(env, "login_failed", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });
    return genericError;
  }

  if (!user.email_verified) {
    await logAuth(env, "login_unverified", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });
    return Response.json({ error: "Email not verified" }, { status: 403 });
  }

  if (user.totp_enabled === 1) {
    const { totp } = await request.json().catch(() => ({}));
    if (!totp) {
      return Response.json({ ok: false, requires_2fa: true }, { status: 200 });
    }
    const valid = await verify2FAChallenge(env, user.id, totp);
    if (!valid) {
      await logAuth(env, "2fa_failed", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });
      return Response.json({ error: "Invalid 2FA code", requires_2fa: true }, { status: 401 });
    }
  }

  await env.DB.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").bind(user.id).run();

  const sess = await createSession(env, user.id, user.tenant_id, request);
  await logAuth(env, "login", { userId: user.id, tenantId: user.tenant_id, ip: ip(request), ua: ua(request) });

  const res = Response.json({
    ok: true,
    user: { email: user.email, role: user.role, tenant_id: user.tenant_id },
    csrf_token: sess.csrf,
  });
  res.headers.set("Set-Cookie", sess.cookie);
  return res;
}

export async function handleLogout(request, env) {
  const session = await getSession(env, request);
  if (session) {
    await destroySession(env, session.sessionId);
    await logAuth(env, "logout", { userId: session.userId, tenantId: session.tenantId, ip: ip(request), ua: ua(request) });
  }
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", clearCookie());
  return res;
}

export async function handleMe(request, env, session) {
  const tenant = await env.DB.prepare(
    "SELECT id, name, factory_name, country, industry, default_protocol, onboarded, created_at FROM tenants WHERE id = ?"
  ).bind(session.tenantId).first();

  return Response.json({
    user: { email: session.email, role: session.role, tenant_id: session.tenantId },
    tenant: tenant || null,
    csrf_token: session.csrfToken,
  });
}
