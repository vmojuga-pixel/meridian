# Guardrails

## Rate Limiting
- Max 1 command per 5s per machine.
- Configurable via KV: `rate_limit:tenant_id:machine_id`.

## Kill Switch
- Global: POST /api/kill with admin key.
- Tenant: POST /api/kill?tenant=ID.
- Effect: all rules stop, no new commands emitted.

## Human Override
- UI toggle per machine.
- When ON: rules engine skips that machine.
- Logged to audit.

## Audit Log
- Every command -> D1 (commands table).
- Every alert -> D1 (alerts table).
- Daily snapshot -> R2 (immutable).
- Format: JSON Lines, append-only.

## Explainability
Every command includes:
- rule_id: which rule triggered
- reason: human-readable explanation
- inputs: data snapshot at decision time
