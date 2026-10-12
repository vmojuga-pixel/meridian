import { CONFIG } from "./config.js";
import { handleIngest } from "./api/ingest.js";
import { handleCommands } from "./api/commands.js";
import { handleDashboard } from "./api/dashboard.js";
import { handleHealth } from "./api/health.js";
import { handleMeriChat } from "./meri/chat.js";
import { handleKillSwitch } from "./guardrail/kill-switch.js";

export { Tenant } from "./tenant/durable-object.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Tenant-ID, X-API-Key",
        },
      });
    }

    // Health
    if (path === "/health") return handleHealth();

    // Kill switch
    if (path === "/api/kill") return handleKillSwitch(request, env);

    // Tenant ID
    const tenantId =
      request.headers.get("X-Tenant-ID") ||
      url.searchParams.get("tenant");

    if (!tenantId && path !== "/health") {
      return Response.json(
        { error: "Missing X-Tenant-ID" },
        { status: 400 }
      );
    }

    // Tenant-scoped routes
    try {
      if (path.startsWith("/api/ingest")) return await handleIngest(request, env, tenantId);
      if (path.startsWith("/api/commands")) return await handleCommands(request, env, tenantId);
      if (path.startsWith("/api/dashboard")) return await handleDashboard(request, env, tenantId);
      if (path.startsWith("/api/meri/chat")) return await handleMeriChat(request, env, tenantId);
    } catch (e) {
      return Response.json(
        { error: "Internal error", message: e.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Not Found", path, app: CONFIG.APP_NAME },
      { status: 404 }
    );
  },

  async scheduled(event, env, ctx) {
    // Nightly: generate Meri reports per tenant
    ctx.waitUntil((async () => {
      const tenants = await env.DB.prepare(
        "SELECT id FROM tenants"
      ).all();

      for (const t of tenants.results || []) {
        try {
          const doId = env.TENANT.idFromName(t.id);
          const stub = env.TENANT.get(doId);
          await stub.fetch("https://internal/report", { method: "POST" });
        } catch (e) {
          console.error("Report failed for", t.id, e.message);
        }
      }
    })());
  },
};
