import { RulesEngine } from "../rules/engine.js";
import { DEFAULT_RULES } from "../rules/registry.js";
import { loadTenantRules } from "../api/rules.js";
import { logAudit } from "../audit/log.js";
import { checkRateLimit } from "../guardrail/rate-limit.js";
import { isKilled } from "../guardrail/kill-switch.js";
import { isHumanOverride } from "../guardrail/human-override.js";

export class Tenant {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.engine = new RulesEngine(DEFAULT_RULES);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/ingest") return this.ingest(request);
    if (path === "/status") return this.status();
    if (path === "/report") return this.report();

    return new Response("Not Found", { status: 404 });
  }

  get tenantId() {
    return this.state.id.toString();
  }

  async ingest(request) {
    const data = await request.json();

    // Guardrail: kill switch
    if (await isKilled(this.env, this.tenantId)) {
      return Response.json({ ok: false, reason: "kill_switch_active" });
    }

    // Guardrail: human override per machine
    if (await isHumanOverride(this.env, this.tenantId, data.machine_id)) {
      return Response.json({ ok: false, reason: "human_override" });
    }

    // Build context
    const ctx = this.makeContext(data.machine_id);

    // Evaluate rules (deterministic)
    const actions = this.engine.evaluate(data, ctx);

    // Store telemetry
    await this.env.DB.prepare(
      "INSERT INTO telemetry (tenant_id, machine_id, temp, rpm, power, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      this.tenantId,
      data.machine_id,
      data.temp ?? null,
      data.rpm ?? null,
      data.power ?? null,
      data.status ?? null
    ).run();

    // Audit (append-only)
    await logAudit(this.env, {
      tenant_id: this.tenantId,
      machine_id: data.machine_id,
      input: data,
      actions,
    });

    return Response.json({ ok: true, actions });
  }

  compileRules(dbRules) {
    const ops = {
      gt: (a, b) => a > b,
      gte: (a, b) => a >= b,
      lt: (a, b) => a < b,
      lte: (a, b) => a <= b,
      eq: (a, b) => a === b,
      neq: (a, b) => a !== b,
    };
    return dbRules.map(r => ({
      id: r.id,
      name: r.name,
      enabled: true,
      when: (d) => {
        const v = d[r.metric];
        if (v === undefined || v === null) return false;
        return ops[r.operator](Number(v), Number(r.threshold));
      },
      then: (ctx, d) => {
        if (r.action === "alert") ctx.alert(`[${r.name}] ${r.metric}=${d[r.metric]}`, r.severity || "warning");
        else if (r.action === "command") ctx.command("set", r.action_value, r.id);
        else if (r.action === "clear") ctx.clearAlert();
      },
    }));
  }

  makeContext(machineId) {
    const self = this;
    return {
      alert: (message, severity = "info") =>
        self.emitAlert(machineId, message, severity),
      command: (action, value, ruleId) =>
        self.emitCommand(machineId, action, value, ruleId),
      clearAlert: () => self.clearAlerts(machineId),
    };
  }

  async emitAlert(machineId, message, severity) {
    await this.env.DB.prepare(
      "INSERT INTO alerts (tenant_id, machine_id, rule_id, severity, message) VALUES (?, ?, ?, ?, ?)"
    ).bind(this.tenantId, machineId, "engine", severity, message).run();
  }

  async emitCommand(machineId, action, value, ruleId) {
    // Guardrail: rate limit
    const allowed = await checkRateLimit(this.env, this.tenantId, machineId);
    if (!allowed) return { skipped: "rate_limited" };

    await this.env.DB.prepare(
      "INSERT INTO commands (tenant_id, machine_id, action, value, reason, rule_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      this.tenantId,
      machineId,
      action,
      value ?? null,
      `rule:${ruleId ?? "manual"}`,
      ruleId ?? null
    ).run();

    return { ok: true, action, value };
  }

  async clearAlerts(machineId) {
    await this.env.DB.prepare(
      "UPDATE alerts SET resolved = 1 WHERE tenant_id = ? AND machine_id = ? AND resolved = 0"
    ).bind(this.tenantId, machineId).run();
  }

  async status() {
    const [alerts, commands, machines] = await Promise.all([
      this.env.DB.prepare(
        "SELECT severity, COUNT(*) as n FROM alerts WHERE tenant_id = ? AND resolved = 0 GROUP BY severity"
      ).bind(this.tenantId).all(),
      this.env.DB.prepare(
        "SELECT COUNT(*) as n FROM commands WHERE tenant_id = ? AND ts > unixepoch() - 86400"
      ).bind(this.tenantId).first(),
      this.env.DB.prepare(
        "SELECT COUNT(DISTINCT machine_id) as n FROM telemetry WHERE tenant_id = ?"
      ).bind(this.tenantId).first(),
    ]);

    return Response.json({
      tenant: this.tenantId,
      alerts: alerts.results || [],
      commands_24h: commands?.n ?? 0,
      machines: machines?.n ?? 0,
    });
  }

  async report() {
    // Placeholder for Meri nightly report
    return Response.json({ ok: true, tenant: this.tenantId });
  }
}
