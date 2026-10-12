import { callTenant } from "../tenant/router.js";

export async function handleDashboard(request, env, tenantId) {
  if (request.method !== "GET") {
    return Response.json({ error: "GET required" }, { status: 405 });
  }

  return callTenant(env, tenantId, "/status", { method: "GET" });
}
