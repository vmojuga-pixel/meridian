import { callTenant } from "../tenant/router.js";

export async function handleIngest(request, env, tenantId) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  const body = await request.text();

  return callTenant(env, tenantId, "/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
