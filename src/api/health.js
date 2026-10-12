import { CONFIG } from "../config.js";

export function handleHealth() {
  return Response.json({
    status: "ok",
    app: CONFIG.APP_NAME,
    version: CONFIG.VERSION,
    ts: Math.floor(Date.now() / 1000),
  });
}
