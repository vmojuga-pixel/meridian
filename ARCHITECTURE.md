# Architecture

## Data Flow — Data Sovereignty by Design

    [ Legacy Machines / PLCs / Sensors ]
                │
                ▼
    [ Meridian Edge Gateway ]  (on-premise)
       • Reads machine data via industrial protocols
       • Stores RAW readings in local SQLite (30-day rolling window)
       • Computes hourly aggregates locally
       • Sends ONLY aggregates to cloud
                │ HTTPS (aggregates + alerts + commands)
                ▼
    [ Meridian Cloud ]
       • Receives hourly aggregates, not raw readings
       • Stores: machines, rules, alerts, commands, aggregates
       • Never receives raw telemetry

**Guarantee:** Raw machine data never leaves the factory by default. The cloud
sees hourly averages, min/max, sample counts, alerts, and commands — never
individual sensor readings.

## Layers

### 1. Edge Gateway (On-Premise)
- Raspberry Pi 4 / Mini-PC / Industrial PC
- Protocol adapters for industrial equipment
- Local SQLite:
  - `readings` — raw samples, rolling 30-day retention
  - `queue` — offline buffer for aggregates when cloud is unreachable
- Computes aggregates every 5 minutes
- TLS-only egress

### 2. Meridian Cloud
- Multi-tenant (one isolated environment per factory)
- Deterministic rules engine (no black box in control loops)
- Immutable audit log
- Advisory AI (never controls machines)

## Data Schema (Cloud)

| Table | Purpose |
|-------|---------|
| `tenants` | Factory accounts |
| `users` | Team members per tenant |
| `sessions` | Auth sessions |
| `api_keys` | Machine auth (scoped) |
| `machines` | Equipment catalog |
| `rules` | Deterministic rules |
| `rule_templates` | Marketplace |
| `telemetry_agg` | Hourly aggregates only |
| `alerts` | Alert events |
| `commands` | Outbound commands |
| `audit_auth` | Auth events |
| `public_kb` | Public Meri knowledge base |

## Data Schema (On-Premise Only)

| Table | Purpose |
|-------|---------|
| `readings` | Raw sensor samples (30-day rolling) |
| `queue` | Offline aggregate buffer |

## Multi-Tenancy
Each tenant has isolated rules, data, users, and audit trail.

## Security
- Password: PBKDF2-SHA256, 100k iterations, salt
- Session: HttpOnly, Secure, SameSite=Strict cookie
- CSRF: token on all state-changing requests
- Rate limits: per-tenant and per-IP
- Kill switch: global and per-tenant
- Secrets: environment only, never in code

## Compliance
- EU AI Act (High-Risk Annex III): human oversight, transparency, record-keeping
- GDPR: data minimisation, on-prem default, no PII in telemetry
- IEC 62443: network segmentation, TLS-only egress
