export const CONFIG = {
  APP_NAME: "Meridian",
  VERSION: "0.1.0",
  RATE_LIMIT_MS: 5000,           // min 5s between commands per machine
  KILL_SWITCH_KEY: "kill:global",
  TENANT_PREFIX: "tenant:",
  RULES_PREFIX: "rules:",
  ALERT_TTL_DAYS: 30,
};

export const SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
  ERROR: "error",
};
