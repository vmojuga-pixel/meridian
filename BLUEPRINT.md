# Meridian — System Blueprint

**Version:** 1.0 · **Status:** Live prototype · **Last updated:** 2026-10-13

This is the source of truth. If code and this document disagree, this document wins.

---

## 1. What Meridian Is

An enterprise AI operations platform for industrial environments.

Mission: bring modern automation, energy intelligence, and operational insight to factories running legacy equipment — without requiring rip-and-replace.

Target market: European Mittelstand, expanding globally.

Positioning: intelligence layer on top of existing production systems.

---

## 2. Core Principles

1. Rules control. AI advises. Humans decide.
2. Raw machine data never leaves the factory by default.
3. Compliance is a design principle, not an afterthought.
4. No black box in safety-critical paths.
5. Multi-tenant isolation by default.

---

## 3. High-Level Architecture

    [ Legacy Industrial Equipment ]
                │
                ▼
    [ Edge Gateway — on-premise ]
       • Reads machine data
       • Stores raw readings locally (30-day rolling)
       • Computes hourly aggregates
       • Sends ONLY aggregates + events to cloud
                │ HTTPS, TLS-only
                ▼
    [ Meridian Cloud — multi-tenant platform ]
       • Rules engine (deterministic)
       • Tenant isolation (per-factory)
       • Audit log (immutable)
       • AI advisor (advisory only)
       • Billing, auth, team, onboarding

---

## 4. Data Sovereignty Contract

| Layer | Location | Content |
|-------|----------|---------|
| Raw sensor readings | On-premise gateway | Every sample, 30-day rolling |
| Hourly aggregates | Cloud | avg/max/min per metric, sample count |
| Alerts | Cloud | Rule-triggered events |
| Commands | Cloud | Outbound actions (audit) |
| Auth & user data | Cloud | Users, sessions, audit |
| Machine catalog | Cloud | Name, brand, model, protocol |

**Guarantee:** Cloud never receives individual sensor readings. Only aggregated summaries, events, and commands. Air-gapped operation supported.

---

## 5. Components

### 5.1 Cloud Platform (meridian-api)

Responsibilities:
- Authentication and session management
- Tenant isolation and routing
- Deterministic rules evaluation
- Alert generation and delivery
- Command dispatch and audit
- AI advisor (advisory only)
- Billing and plan enforcement
- Public knowledge base for Meri
- Realtime broadcast to dashboards

### 5.2 Edge Gateway (meridian-edge)

Responsibilities:
- Read machine data via industrial protocols
- Store raw readings locally
- Compute hourly aggregates
- Send aggregates to cloud
- Receive commands and apply them
- Buffer aggregates when offline (store-and-forward)

### 5.3 Meri (AI Advisor)

Two modes:

| Mode | Location | Data Access | Purpose |
|------|----------|-------------|---------|
| Enterprise | Inside dashboard (auth) | Tenant-scoped aggregates | Help managers understand operations |
| Public | Landing page | Public KB only | Explain Meridian to visitors |

Neither mode can send commands. Neither mode can change rules.

---

## 6. Features (Current)

### Auth & Security
- Email + password signup, verify, login, logout
- Session cookies (HttpOnly, Secure, SameSite=Strict)
- CSRF protection on all state-changing requests
- Rate limiting (per-IP, per-tenant)
- Account lockout after failed attempts
- 2FA (TOTP + recovery codes)
- Audit log for all auth events

### Tenant Management
- Multi-tenant isolation (per-factory environment)
- Team invites with roles (owner / admin / viewer)
- Onboarding wizard (3 steps)

### Operations
- Machine catalog (CRUD)
- Rules engine (CRUD + marketplace templates)
- Alert generation and dashboard display
- Command dispatch with audit
- Realtime updates to dashboard
- Hourly aggregate storage

### Billing
- Plan tiers (Free / Starter / Growth / Enterprise)
- Usage limits enforced per plan
- Stripe checkout integration

### Compliance
- Immutable audit log
- Human oversight on all decisions
- EU AI Act aligned (High-Risk Annex III)
- GDPR: on-prem default, no PII in telemetry
- IEC 62443: TLS-only egress, network segmentation

---

## 7. Not Yet Built

| Item | Priority | Notes |
|------|----------|-------|
| Rules editor UI (visual) | Medium | Currently form-based |
| Historical analytics dashboard | Medium | Aggregates stored, no charts yet |
| Mobile app | Low | Web is responsive |
| Multi-language (DE/FR/IT) | High | Required for European expansion |
| SAP / MES connectors | High | Listed in pitch, not implemented |
| Custom protocol adapters (PROFINET native) | High | Currently via OPC UA bridge |
| White-label for partners | Low | Post-revenue decision |
| SOC 2 / ISO 27001 audit | Medium | Required for enterprise deals |
| On-premise cloud deployment option | Medium | For defence/pharma |

---

## 8. Tech Stack (Corporate-Safe Description)

| Layer | Description |
|-------|-------------|
| Cloud runtime | Edge-native serverless platform |
| Database | Managed SQLite (per-tenant isolation) |
| Object storage | Immutable audit log store |
| Key-value store | Session, rate limit, config |
| AI | Edge-hosted inference (no data retention by provider) |
| Gateway | Python 3.10+, SQLite, runs on Raspberry Pi or industrial PC |
| Protocols | Modbus, OPC-UA, Serial (extensible) |

Technical vendor names are intentionally omitted from external documents. See internal deployment docs for specifics.

---

## 9. Deployment Model

| Phase | Duration | Action |
|-------|----------|--------|
| Discovery | Week 1 | Site visit, machine inventory, protocol mapping |
| Edge Install | Week 2 | Gateway on-premise, read-only |
| Rules Config | Week 3 | Workshop, thresholds, alerts |
| Go Live | Week 4 | Closed-loop commands enabled (kill switch active) |
| Optimisation | Ongoing | Quarterly reviews, new rules |

Safety: Weeks 1–3 strictly read-only.

---

## 10. Commercial Model

| Plan | Price | Machines | Users |
|------|-------|----------|-------|
| Free | €0 | 3 | 2 |
| Starter | €49/mo | 25 | 10 |
| Growth | €199/mo | 200 | 50 |
| Enterprise | €999/mo | Unlimited | Unlimited |

Deployment: €5,000–€15,000 one-time per site.

---

## 11. Repos

| Repo | Purpose |
|------|---------|
| `vmojuga-pixel/meridian` | Cloud platform |
| `vmojuga-pixel/meridian-edge` | On-premise gateway |

---

## 12. Live

- Cloud: meridian-api.vmojuga.workers.dev
- Landing: meridian-api.vmojuga.workers.dev/
- Dashboard: meridian-api.vmojuga.workers.dev/dashboard
- Public Meri: landing page, section "Ask Meri"
- Enterprise Meri: inside dashboard

---

## 13. Honest Status (2026-10-13)

**Working:**
- Full auth stack
- Multi-tenant platform
- Rules engine (functional, deterministic)
- Machines + team + billing + invites
- Meri (both modes)
- Edge gateway (Modbus, OPC-UA, Serial)
- Aggregate-only data flow

**Prototype-level:**
- Dashboard is functional but minimal
- Rules editor is form-based, not visual
- No historical charts yet
- No multi-language yet

**Not started:**
- SAP / MES integration
- SOC 2 / ISO 27001 certification
- Enterprise sales motion
- Real customer pilot

**Ready for:** EWOR application and demo. Not ready for: enterprise procurement.
