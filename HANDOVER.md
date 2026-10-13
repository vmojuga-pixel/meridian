# HANDOVER

## Repos

| Repo | Purpose |
|------|---------|
| `vmojuga-pixel/meridian` | Cloud platform (edge runtime) |
| `vmojuga-pixel/meridian-edge` | On-premise gateway (Python) |

## Live

- Cloud: `meridian-api.vmojuga.workers.dev`
- Landing: `meridian-api.vmojuga.workers.dev/`
- Dashboard: `meridian-api.vmojuga.workers.dev/dashboard` (auth)
- Meri enterprise: inside dashboard (auth)
- Meri public: landing page section `#ask-meri`

## Data Sovereignty

Raw machine data stays on-premise by default. Only hourly aggregates,
alerts, and commands sync to cloud. See ARCHITECTURE.md.

## Cloud Resources

| Resource | Name |
|----------|------|
| Compute | meridian-api |
| Database | meridian-db |
| Key-Value | MERIDIAN_KV |
| Object Storage | meridian-audit |
| Tenant isolation | Tenant object (per-factory) |
| AI | Workers AI binding |

## Secrets (set via wrangler secret put)

- `BREVO_API_KEY` — email delivery
- `MAILTRAP_TOKEN` — email fallback (sandbox)
- `EMAIL_FROM` — sender address
- `STRIPE_SECRET_KEY` — billing (optional)
- `STRIPE_PRICE_MAP` — plan IDs JSON (optional)

## Deploy

    cd ~/meridian-core
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key)
    export CLOUDFLARE_ACCOUNT_ID=695a620ee3223aa69b69b1e48eb91962
    npx wrangler deploy

## Migrations

    npx wrangler d1 migrations apply meridian-db --remote

| File | Purpose |
|------|---------|
| 0001_init | Tenants, telemetry (legacy), commands, alerts, rules |
| 0002_auth | Users, sessions, api_keys, machines, audit_auth |
| 0003_apikeys | onboarded_at |
| 0004_2fa | TOTP columns |
| 0005_invites | Team invites |
| 0006_billing | Plans, Stripe columns |
| 0007_templates | Rule marketplace |
| 0008_public_kb | Public KB table |
| 0009_kb_seed | KB entries |
| 0010_aggregate | telemetry_agg (aggregate-only cloud ingest) |

## Edge Gateway

Repo: `meridian-edge`
- Python 3.10+
- SQLite local buffer
- Env: `MERIDIAN_URL`, `MERIDIAN_API_KEY`, `MACHINE_ID`, `PROTOCOL`
- Run: `python gateway.py`
- systemd service template in repo README

## Features

- Auth: signup, login, verify, 2FA (TOTP + recovery), session, CSRF, rate limit, lockout
- Team: invites with roles (owner / admin / viewer)
- Onboarding: 3-step wizard
- Machines: CRUD, per-tenant
- Rules: CRUD + marketplace templates
- Meri: enterprise (in-dashboard, tenant-scoped) + public (landing, KB-backed, sanitized)
- Realtime: WebSocket broadcast on aggregate ingest
- Billing: plans, usage limits, Stripe checkout
- Audit: D1 + R2 (immutable)

## Safety & Compliance

- Deterministic control (rules), advisory AI (Meri)
- Kill switch, rate limits, human override
- Immutable audit log with reason field
- EU AI Act aligned
- GDPR: on-prem default, no PII in telemetry
- IEC 62443: TLS-only egress, segmented network

## Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 on public Meri | Route order | `/api/meri/public` must be before auth check |
| Deploy fails 6111 | Wrong token | `CLOUDFLARE_API_TOKEN` must be CF token, not generic API_TOKEN |
| Raw data leaks | DO old code | Ensure `telemetry_agg` UPSERT is active |
| Meri leaks tech detail | Prompt drift | Sanitize function in `src/meri/public.js` |
