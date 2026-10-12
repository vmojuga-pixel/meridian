import { describe, it, expect } from "vitest";
import { handleHealth } from "../src/api/health.js";

describe("Health endpoint", () => {
  it("returns ok", async () => {
    const res = handleHealth();
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.app).toBe("Meridian");
  });
});
