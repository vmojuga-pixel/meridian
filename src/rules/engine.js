export class RulesEngine {
  constructor(rules = []) {
    this.rules = rules;
  }

  evaluate(data, ctx) {
    const results = [];
    for (const rule of this.rules) {
      try {
        if (!rule.enabled && rule.enabled !== undefined) continue;
        if (rule.when(data)) {
          const result = rule.then(ctx, data);
          results.push({
            rule: rule.id,
            ok: true,
            result: result ?? null,
          });
        }
      } catch (e) {
        results.push({
          rule: rule.id,
          ok: false,
          error: e.message,
        });
        ctx.alert(`Rule ${rule.id} failed: ${e.message}`, "error");
      }
    }
    return results;
  }
}
