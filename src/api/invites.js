import { randomHex, sha256Hex } from "../auth/password.js";
import { logAuth } from "../auth/audit.js";
import { sendInviteEmail } from "../auth/email.js";

function ip(request) { return request.headers.get("CF-Connecting-IP") || "unknown"; }
function ua(request) { return request.headers.get("User-Agent") || "unknown"; }

const ROLES = ["admin", "viewer"];

export async function handleInviteList(request, env, session) {
  if (session.role !== "owner" && session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await env.DB.prepare(
    "SELECT id, email, role, expires_at, accepted_at, created_at FROM invites WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(session.tenantId).all();
  return Response.json({ invites: rows.results || [] });
}

export async function handleInviteCreate(request, env, session) {
  if (session.role !== "owner" && session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const email = (body.email || "").toLowerCase();
  const role = ROLES.includes(body.role) ? body.role : "viewer";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const existingUser = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ? AND tenant_id = ?"
  ).bind(email, session.tenantId).first();
  if (existingUser) return Response.json({ error: "User already in tenant" }, { status: 409 });

  const raw = randomHex(24);
  const tokenHash = await sha256Hex(raw);
  const id = "i_" + randomHex(8);
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;

  await env.DB.prepare(
    "INSERT INTO invites (id, tenant_id, email, role, token_hash, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, session.tenantId, email, role, tokenHash, session.userId, expiresAt).run();

  const origin = new URL(request.url).origin;
  const inviteUrl = origin + "/accept?token=" + raw;

  const tenant = await env.DB.prepare("SELECT factory_name FROM tenants WHERE id = ?").bind(session.tenantId).first();
  const mail = await sendInviteEmail(env, {
    to: email,
    factoryName: (tenant && tenant.factory_name) || "a Meridian tenant",
    role,
    inviteUrl,
  });

  await logAuth(env, "invite_created", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { invite_id: id, email, role, email_sent: mail.ok },
  });

  return Response.json({ ok: true, invite: { id, email, role, expires_at: expiresAt }, email_sent: mail.ok }, { status: 201 });
}

export async function handleInviteRevoke(request, env, session, inviteId) {
  if (session.role !== "owner" && session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const row = await env.DB.prepare(
    "SELECT id FROM invites WHERE id = ? AND tenant_id = ?"
  ).bind(inviteId, session.tenantId).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM invites WHERE id = ? AND tenant_id = ?")
    .bind(inviteId, session.tenantId).run();
  await logAuth(env, "invite_revoked", {
    userId: session.userId, tenantId: session.tenantId,
    ip: ip(request), ua: ua(request), meta: { invite_id: inviteId },
  });
  return Response.json({ ok: true });
}

export async function handleInviteAccept(request, env) {
  const body = await request.json();
  const { token, password } = body;
  if (!token || !password) return Response.json({ error: "Token and password required" }, { status: 400 });

  const { validatePassword, hashPassword, randomSalt } = await import("../auth/password.js");
  const pErr = validatePassword(password);
  if (pErr) return Response.json({ error: pErr }, { status: 400 });

  const tokenHash = await sha256Hex(token);
  const now = Math.floor(Date.now() / 1000);
  const invite = await env.DB.prepare(
    "SELECT id, tenant_id, email, role, expires_at, accepted_at FROM invites WHERE token_hash = ?"
  ).bind(tokenHash).first();

  if (!invite) return Response.json({ error: "Invalid invite" }, { status: 400 });
  if (invite.accepted_at) return Response.json({ error: "Already accepted" }, { status: 400 });
  if (invite.expires_at < now) return Response.json({ error: "Invite expired" }, { status: 400 });

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(invite.email).first();
  if (existing) return Response.json({ error: "Email already registered" }, { status: 409 });

  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  const userId = "u_" + randomHex(8);

  await env.DB.prepare(
    "INSERT INTO users (id, tenant_id, email, password_hash, salt, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)"
  ).bind(userId, invite.tenant_id, invite.email, hash, salt, invite.role).run();

  await env.DB.prepare("UPDATE invites SET accepted_at = ? WHERE id = ?").bind(now, invite.id).run();

  await logAuth(env, "invite_accepted", {
    userId, tenantId: invite.tenant_id,
    ip: ip(request), ua: ua(request), meta: { invite_id: invite.id, role: invite.role },
  });

  return Response.json({ ok: true, message: "Account created. You can log in now." });
}
