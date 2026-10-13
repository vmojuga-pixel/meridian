# HANDOVER

**Version:** 2.0 · **Last updated:** 2026-10-14
**Status:** Live prototype · No customers yet · EWOR application in progress

---

## 0. What This Document Is

Master handover for Meridian. Covers how the system works, why it exists, what decisions were made, what was intentionally left out, and what comes next.

If taking over, read end to end before touching code. BLUEPRINT.md, ARCHITECTURE.md, CODING_BOOK.md are detail layers. This is the context layer.

---

## 1. Vision & Mission

**Vision:** A single, standardised intelligence layer for every legacy industrial machine in Europe — and eventually the world.

**Mission:** Give factories that cannot afford rip-and-replace the ability to modernise with AI, without sacrificing data sovereignty, compliance, or human control.

**One-liner:** Deterministic AI operations for legacy industrial systems.

**Positioning:** Infrastructure, not another SaaS.

---

## 2. Who Built This

Solo technical founder based in Borneo, Malaysia. Full-time hospitality worker (12-hour shifts). Builds on a mobile device — no laptop, no desktop, no team.

Uses AI as a collaborative partner. Architecture and decisions are deliberate.

Adjacent experience: low-level systems (C++, SIMD, zero-copy), edge computing, full-stack SaaS, agentic orchestration.

This is the founder's first venture in the industrial sector. Meridian was designed and shipped within one day, working between shifts.

---

## 3. History (Timeline)

| Date | Event |
|------|-------|
| Pre-2026 | Founder builds other platforms (27 total; 1 shipped, 26 at 80-90%) |
| 2026-10-12 | Meridian conceptualised; architecture drafted; repo created |
| 2026-10-12 | Cloud platform deployed, live |
| 2026-10-13 | Auth, 2FA, team, onboarding, machines, rules, Meri, billing, WebSocket |
| 2026-10-13 | Edge gateway implemented (Modbus, OPC-UA, Serial) |
| 2026-10-13 | Data sovereignty refactor: raw stays on-prem, cloud gets aggregates only |
| 2026-10-13 | Public Meri launched with KB + sanitizer + rate limit |
| 2026-10-13 | BLUEPRINT.md, ARCHITECTURE.md, HANDOVER.md, CODING_BOOK.md finalised |
| 2026-10-14 | EWOR application drafted (Traction Fellowship) |

---

## 4. Key Decisions (and Why)

### 4.1 Aggregate-only cloud flow
**Decision:** Raw sensor readings never leave the factory. Cloud receives only hourly aggregates.
**Why:** EU AI Act + GDPR + customer trust. Mittelstand factories will not accept cloud-first AI. Data sovereignty is our moat against US competitors.
**Trade-off:** Slight complexity at gateway. Worth it.

### 4.2 Deterministic rules engine over LLM control
**Decision:** Machine control handled by deterministic rules, not AI. Meri (LLM) is advisory only.
**Why:** Safety. Auditability. EU AI Act Article 13 requires explainability.
**Trade-off:** Rules must be authored. We provide templates + marketplace.

### 4.3 Multi-tenant via Durable Objects (one per factory)
**Decision:** Every tenant gets an isolated environment.
**Why:** Isolation of data, rules, audit trail.
**Trade-off:** Slightly more complex routing.

### 4.4 Edge-native, not cloud-native
**Decision:** Platform runs at the edge, not central region.
**Why:** Latency. Data locality. Multi-jurisdiction compliance.
**Trade-off:** Vendor-specific. Should be abstracted if migrating.

### 4.5 Public Meri on landing page
**Decision:** Meri exists in two modes — enterprise (dashboard) and public (landing).
**Why:** Sales. Visitors should ask about Meridian without signing up.
**Trade-off:** Rate limit + sanitizer add code. Worth it for lead capture.

### 4.6 English-only UI (for now)
**Decision:** No multi-language in MVP.
**Why:** Speed. DACH languages required for European GTM, not for EWOR application.
**Trade-off:** Will block enterprise deals in DACH until localised. Priority month 3-6 post-funding.

---

## 5. What Was Intentionally Skipped (and Why)

### 5.1 Native protocols beyond Modbus / OPC-UA / Serial
**Skipped:** PROFINET, PROFIBUS, EtherNet/IP, EtherCAT, MQTT native adapters.
**Why:** Requires hardware to test. No factory access yet.
**Status:** Roadmap, month 3-6 post-funding.

### 5.2 SAP / SCADA integration
**Skipped:** Direct connectors to Siemens WinCC, AVEVA, Ignition, FactoryTalk, SAP S/4HANA.
**Why:** Enterprise integrations require enterprise contracts. Not realistic pre-revenue.
**Status:** Roadmap, Q2-Q3 2027.

### 5.3 Formal EU AI Act + IEC 62443 certification
**Skipped:** Accredited certification from TUV / DEKRA.
**Why:** Costs 30k-100k EUR. Not a solo founder expense pre-funding.
**Status:** Aligned today; certified post-funding.

### 5.4 Historical analytics dashboard
**Skipped:** Charts, trend analysis, KPI dashboard.
**Why:** Aggregates stored, visualisation minimal. Need real customer feedback first.
**Status:** Awaiting pilot.

### 5.5 Mobile app
**Skipped:** Native iOS/Android.
**Why:** Web is responsive. Native adds no value until customers demand it.
**Status:** Not planned.

### 5.6 SOC 2 / ISO 27001
**Skipped:** Formal audit certifications.
**Why:** Expensive, only required for large enterprise.
**Status:** Roadmap, post-Series A.

---

## 6. Numbering Convention (CODING_BOOK.md)

| Range | Meaning |
|-------|---------|
| 1-100 | General lessons (any project) |
| 101+ | Meridian-specific lessons |

**Gap 8-100 is intentional.** Reserved for future general lessons. Do not renumber. New general lessons go 8, 9, 10... New Meridian-specific go 109, 110, 111...

---

## 7. What Comes Next (Roadmap)

### Immediate (next 2 weeks)
- Submit EWOR application (Traction Fellowship)
- Prepare 90-second demo video
- Prepare 3-minute technical walkthrough
- Polish public Meri answers

### Short-term (0-6 months post-funding)
- Hire DACH industrial sales lead
- Hire Compliance / QA engineer (part-time)
- Relocate to Europe
- Build PROFINET + EtherNet/IP native adapters
- Procure hardware (edge units, testing rigs)
- First 3-5 free pilot installations

### Mid-term (6-18 months)
- 20 pilot installations in DE/AT
- Energy Module v1
- Multi-language UI (DE, FR, IT)
- Formal EU AI Act + IEC 62443 certification
- SAP / SCADA integration (Q2-Q3 2027)
- 50 paying customers

### Long-term (18+ months)
- Series A
- Pan-European expansion
- Digital Twin integration
- 2,000+ customers (2029 target)
- 10M EUR ARR (2029 target)

---

## 8. Environment & Credentials

### Local environment
- VPS: Debian, root access
- Repos: ~/meridian-core/, ~/meridian-edge/
- Cloudflare token: /root/.cf-key
- Cloudflare account: 695a620ee3223aa69b69b1e48eb91962
- No local .env for Meridian — all secrets via wrangler secret put

### Production secrets (via wrangler)
- BREVO_API_KEY — email
- MAILTRAP_TOKEN — email fallback
- EMAIL_FROM — sender
- STRIPE_SECRET_KEY — billing (optional)
- STRIPE_PRICE_MAP — plan IDs JSON (optional)

### Never store in code or repo
- API keys
- Cloudflare tokens
- Database IDs identifying account
- Email addresses of tenants
- Any customer data

---

## 9. How to Deploy

    cd ~/meridian-core
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key)
    export CLOUDFLARE_ACCOUNT_ID=695a620ee3223aa69b69b1e48eb91962
    npx wrangler deploy

Migrations:

    npx wrangler d1 migrations apply meridian-db --remote

Edge gateway:

    cd ~/meridian-edge
    python3 gateway.py

---

## 10. Migration History

| File | Purpose |
|------|---------|
| 0001_init | Tenants, telemetry (legacy), commands, alerts, rules |
| 0002_auth | Users, sessions, api_keys, machines, audit_auth |
| 0003_apikeys | onboarded_at column |
| 0004_2fa | TOTP columns |
| 0005_invites | Team invites |
| 0006_billing | Plans, Stripe columns |
| 0007_templates | Rule marketplace |
| 0008_public_kb | Public KB table |
| 0009_kb_seed | KB entries |
| 0010_aggregate | telemetry_agg (aggregate-only cloud ingest) |

Never delete old migrations. Always add new ones.

---

## 11. Failure Modes (and Fixes)

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 401 on /api/meri/public | Route order | Public routes before requireAuth |
| Deploy fails 6111 | Wrong token | Use /root/.cf-key, not API_TOKEN |
| Raw data leaks to cloud | DO old code | Ensure telemetry_agg UPSERT active |
| Meri leaks vendor names | Prompt drift | Sanitize function in src/meri/public.js |
| 500 on /dashboard | DO timeout | Check Durable Object logs |
| Email not sent | Brevo quota | Check Brevo dashboard + EMAIL_FROM |
| WebSocket disconnects | Idle timeout | Client reconnects every 3 seconds |
| Migration fails | Schema conflict | Check order, run fresh D1 |

---

## 12. Known Limitations

1. No hardware tested. Gateway code written, never run on real Raspberry Pi or factory floor.
2. No customers. Zero.
3. No pilot. No factory installed Meridian.
4. Protocols limited. Modbus, OPC-UA, Serial only.
5. No SAP / SCADA. Roadmap only.
6. No formal certification. Aligned, not certified.
7. No multi-language. English only.
8. Single-region deployment. Not tested across regions.
9. No load testing. Never tested with 1000+ concurrent machines.
10. No disaster recovery plan. No documented D1 recovery.

---

## 13. Contact

- Email: legates@northerncoastgroup.com
- Live: meridian-api.vmojuga.workers.dev
- Code: github.com/vmojuga-pixel/meridian
- Edge: github.com/vmojuga-pixel/meridian-edge

---

**End of Handover.**
