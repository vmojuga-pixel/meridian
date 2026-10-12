import { describe, it, expect } from "vitest";
import { RulesEngine } from "../src/rules/engine.js";
import { temperatureRules } from "../src/rules/temperature.js";

function mockCtx() {
  const calls = { alerts: [], commands: [], clear: 0 };
  return {
    calls,
    alert: (m, s) => calls.alerts.push({ m, s }),
    command: (a, v, r) => calls.commands.push({ a, v, r }),
    clearAlert: () => calls.clear++,
  };
}

describe("RulesEngine", () => {
  it("fires TEMP_CRITICAL above 95", () => {
    const engine = new RulesEngine(temperatureRules);
    const ctx = mockCtx();
    engine.evaluate({ machine_id: "m1", temp: 96, rpm: 3000 }, ctx);
    expect(ctx.calls.alerts.length).toBeGreaterThan(0);
    expect(ctx.calls.commands.length).toBe(1);
  });

  it("fires TEMP_WARN between 85 and 95", () => {
    const engine = new RulesEngine(temperatureRules);
    const ctx = mockCtx();
    engine.evaluate({ machine_id: "m1", temp: 88, rpm: 3000 }, ctx);
    expect(ctx.calls.alerts.length).toBeGreaterThan(0);
    expect(ctx.calls.commands.length).toBe(0);
  });

  it("clears alert below 80", () => {
    const engine = new RulesEngine(temperatureRules);
    const ctx = mockCtx();
    engine.evaluate({ machine_id: "m1", temp: 75, rpm: 3000 }, ctx);
    expect(ctx.calls.clear).toBe(1);
  });

  it("handles rule failure gracefully", () => {
    const badRule = {
      id: "BAD",
      when: () => true,
      then: () => { throw new Error("boom"); },
    };
    const engine = new RulesEngine([badRule]);
    const ctx = mockCtx();
    const results = engine.evaluate({}, ctx);
    expect(results[0].ok).toBe(false);
    expect(ctx.calls.alerts.length).toBe(1);
  });
});
