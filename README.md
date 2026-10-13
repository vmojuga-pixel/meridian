# Meridian

Deterministic rules engine for legacy industrial systems.
Edge-native. Multi-tenant. EU AI Act ready.

**Meri** is the chatbox — AI advisor. Meri never controls machines.

Related: **meridian-edge** (Python gateway), Picksy (affiliate), BorneoMe (travel).

## Features

- Auth: signup, login, verify, session, CSRF, rate limit, lockout
- 2FA: TOTP + recovery codes
- Team: invites, roles (owner/admin/viewer)
- Onboarding: 3-step wizard
- Machines: CRUD, per-tenant
- Rules: CRUD + marketplace templates
- API Keys: scoped (ingest:write/read)
- Realtime: WebSocket broadcast on telemetry
- Audit log: D1 + R2 (immutable)
- Billing: plans, usage limits, Stripe checkout
- Email: Brevo + Mailtrap fallback
- Edge Gateway: Python (Modbus/OPC-UA/Serial)
- UI: Tailwind (landing, dashboard, Meri, onboarding, auth)
- Compliance: EU AI Act (audit, guardrails, explainability)

## Endpoints

Public:
- `GET /` — landing
- `GET /signup`, `GET /login`, `GET /verify`, `GET /accept`
- `POST /api/auth/signup`, `/login`, `/logout`
- `GET /api/auth/verify`, `/me`
- `POST /api/auth/accept`
- `POST /api/stripe/webhook`
- `GET /health`

Authed:
- `GET /dashboard`, `/meri`, `/onboarding`
- `GET/POST/PATCH/DELETE /api/machines`
- `GET/POST/PATCH/DELETE /api/rules`
- `GET/POST/DELETE /api/keys`
- `GET/POST/DELETE /api/invites`
- `GET/POST /api/2fa/*`
- `GET /api/billing/plans`, `/current`; `POST /select`, `/checkout`
- `GET /api/templates`; `POST /api/templates/:id/install`
- `POST /api/ingest` (via API key, no session)
- `POST /api/commands`
- `GET /api/dashboard`
- `POST /api/meri/chat`
- `WS /api/ws`
- `POST /api/kill`

## Deploy

Cloudflare Workers. Auto via wrangler or GitHub Actions (needs `CF_API_TOKEN`, `CF_ACCOUNT_ID` secrets).

## License

MIT
