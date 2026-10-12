import { getSession, clearCookie } from "./session.js";

export async function requireAuth(env, request) {
  const session = await getSession(env, request);
  if (!session) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!session.emailVerified) {
    return { error: Response.json({ error: "Email not verified" }, { status: 403 }) };
  }
  return { session };
}

export async function requireCSRF(env, request, session) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return { ok: true };
  const header = request.headers.get("X-CSRF-Token");
  if (!header || header !== session.csrfToken) {
    return { error: Response.json({ error: "Invalid CSRF token" }, { status: 403 }) };
  }
  return { ok: true };
}

export function securityHeaders(res) {
  const h = new Headers(res.headers);
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "DENY");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  h.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
