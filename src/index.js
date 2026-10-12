import { CONFIG } from "./config.js";
import { handleIngest } from "./api/ingest.js";
import { handleCommands } from "./api/commands.js";
import { handleDashboard } from "./api/dashboard.js";
import { handleHealth } from "./api/health.js";
import { handleMeriChat } from "./meri/chat.js";
import { handleKillSwitch } from "./guardrail/kill-switch.js";
import { handleSignup, handleLogin, handleLogout, handleVerify, handleMe } from "./api/auth.js";
import { handleMachinesList, handleMachineCreate, handleMachineDelete } from "./api/machines.js";
import { requireAuth, requireCSRF, securityHeaders } from "./auth/middleware.js";
import { LANDING_HTML } from "./web/landing.js";
import { DASHBOARD_HTML } from "./web/dashboard.js";
import { SIGNUP_HTML, LOGIN_HTML, VERIFY_HTML } from "./web/auth.js";
import { MERI_HTML } from "./meri/ui.js";

export { Tenant } from "./tenant/durable-object.js";

const html = (body) => new Response(body, { headers: { "Content-Type": "text/html;charset=utf-8" } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Tenant-ID, X-API-Key, X-CSRF-Token",
        },
      });
    }

    // --- Public routes ---
    if (path === "/health") return handleHealth();
    if (path === "/" || path === "") return html(LANDING_HTML);
    if (path === "/signup") return html(SIGNUP_HTML);
    if (path === "/login") return html(LOGIN_HTML);
    if (path === "/verify") return html(VERIFY_HTML);

    // --- Auth API ---
    if (path === "/api/auth/signup" && request.method === "POST") return handleSignup(request, env);
    if (path === "/api/auth/login" && request.method === "POST") return handleLogin(request, env);
    if (path === "/api/auth/logout" && request.method === "POST") return handleLogout(request, env);
    if (path === "/api/auth/verify" && request.method === "GET") return handleVerify(request, env);

    // --- Auth required below ---
    const auth = await requireAuth(env, request);
    if (auth.error) return securityHeaders(auth.error);
    const session = auth.session;

    const csrf = await requireCSRF(env, request, session);
    if (csrf.error) return securityHeaders(csrf.error);

    if (path === "/api/auth/me" && request.method === "GET") {
      return securityHeaders(await handleMe(request, env, session));
    }

    if (path === "/dashboard") return html(DASHBOARD_HTML);
    if (path === "/meri") return html(MERI_HTML);

    if (path === "/api/machines" && request.method === "GET") {
      return securityHeaders(await handleMachinesList(request, env, session));
    }
    if (path === "/api/machines" && request.method === "POST") {
      return securityHeaders(await handleMachineCreate(request, env, session));
    }
    if (path.startsWith("/api/machines/") && request.method === "DELETE") {
      const id = path.slice("/api/machines/".length);
      return securityHeaders(await handleMachineDelete(request, env, session, id));
    }

    if (path === "/api/kill") return handleKillSwitch(request, env);

    const tenantId = session.tenantId;

    try {
      if (path.startsWith("/api/ingest")) return await handleIngest(request, env, tenantId);
      if (path.startsWith("/api/commands")) return await handleCommands(request, env, tenantId);
      if (path.startsWith("/api/dashboard")) return await handleDashboard(request, env, tenantId);
      if (path.startsWith("/api/meri/chat")) return await handleMeriChat(request, env, tenantId);
    } catch (e) {
      return securityHeaders(Response.json({ error: "Internal error", message: e.message }, { status: 500 }));
    }

    return securityHeaders(Response.json({ error: "Not Found", path }, { status: 404 }));
  },
};
