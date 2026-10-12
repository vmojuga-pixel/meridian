export function getTenantStub(env, tenantId) {
  const id = env.TENANT.idFromName(tenantId);
  return env.TENANT.get(id);
}

export async function callTenant(env, tenantId, path, init = {}) {
  const stub = getTenantStub(env, tenantId);
  const url = `https://internal${path}`;
  return stub.fetch(url, init);
}
