import { temperatureRules } from "./temperature.js";
import { powerRules } from "./power.js";
import { machineRules } from "./machine.js";

export const DEFAULT_RULES = [
  ...temperatureRules,
  ...powerRules,
  ...machineRules,
];

export async function loadRules(env, tenantId) {
  try {
    const key = `rules:${tenantId}`;
    const stored = await env.KV.get(key, "json");
    if (stored && Array.isArray(stored)) {
      // Rules from KV are declarative (JSON), not functions.
      // For v0.1, fall back to DEFAULT_RULES.
      // TODO: rule compiler in v0.2
    }
  } catch (e) {
    console.error("loadRules failed:", e.message);
  }
  return DEFAULT_RULES;
}
