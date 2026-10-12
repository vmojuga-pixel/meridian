# Meridian

> Deterministic rules engine for legacy industrial systems.
> Edge-native. Multi-tenant. EU AI Act ready.

## What is Meridian?

Meridian bridges legacy industrial machines (PLC, SCADA, Modbus, OPC-UA)
with modern AI-driven operations -- without replacing existing infrastructure.

Runs on Cloudflare Workers. Durable Objects per tenant. D1 per tenant.
Every factory gets isolated rules, data, and audit trail.

**Meri** is the chatbox -- AI advisor. Meri never controls machines.

## Core Principles

1. Deterministic first -- rules engine controls, not LLMs.
2. Data sovereignty -- data stays on-premise by default.
3. Compliance by design -- every action logged and auditable.
4. Edge-native -- auto-scales, zero ops.
5. LLM as advisor -- Meri suggests, humans decide.

## Architecture

    [Legacy Machines] -> [Edge Gateway] -> [Cloudflare Workers]
                                              |
                                    [Durable Objects per tenant]
                                              |
                                    [D1] [KV] [R2] [Queues]

## Features

- Multi-tenant (per-factory Durable Object)
- Rules engine (deterministic, hot-reloadable via KV)
- Real-time telemetry ingestion
- Guardrails (rate limit, kill switch, human override)
- Immutable audit log (R2)
- Meri chatbox (LLM advisor)
- Edge-native (Cloudflare Workers)

## Quick Start

    npm install
    npx wrangler login
    npx wrangler d1 create meridian-db
    npx wrangler kv:namespace create MERIDIAN_KV
    npx wrangler r2 bucket create meridian-audit
    npx wrangler d1 migrations apply meridian-db
    npx wrangler deploy

Update wrangler.toml with the IDs returned.

## API

    POST /api/ingest        # telemetry
    GET  /api/dashboard     # status
    POST /api/commands      # outbound commands
    POST /api/meri/chat     # ask Meri
    POST /api/kill          # kill switch
    GET  /health            # health check

All tenant-scoped routes require X-Tenant-ID header.

## Related Projects

- Picksy -- affiliate platform
- BorneoMe -- travel platform
- Meridian -- industrial AI

## License

MIT
