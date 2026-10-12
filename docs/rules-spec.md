# Rules Spec

## Structure

    {
      id: "TEMP_WARN",
      when: (data) => data.temp >= 85,
      then: (ctx, data) => ctx.alert("Temp high", "warning")
    }

## Fields

- id: unique string, uppercase snake_case
- when: function -> boolean
- then: function -> void

## Context (ctx)

- ctx.alert(message, severity)  -- create alert
- ctx.command(action, value)    -- send command to machine
- ctx.clearAlert()              -- resolve open alerts

## Data Shape

    {
      machine_id: "press-01",
      temp: 87.5,
      rpm: 3020,
      power: 12.4,
      status: "running"
    }

## Loading

Rules loaded from KV key `rules:{tenant_id}`.
Hot-reload: update KV, next request picks up new rules.

## Failures

If a rule throws, engine logs error and continues.
Failed rule is excluded from audit (marked "rule_error").
