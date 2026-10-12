# Architecture

## Layers

### 1. Cloudflare Edge (Meridian Core)
- Workers: API entry, routing
- Durable Objects: one per tenant (factory)
- D1: SQLite per tenant
- KV: global config, rules registry
- R2: immutable audit logs
- Queues: async jobs
- Cron: nightly reports

### 2. Edge Gateway (On-Premise)
- Raspberry Pi / Mini PC at factory
- Reads PLC via Modbus / OPC-UA / Serial
- Store-and-forward: works offline

### 3. Legacy Machines
- PLCs, SCADA, sensors -- not modified

## Data Flow

    Machine -> PLC -> Gateway -> Meridian Core -> Rules Engine
                                                       |
                                              Alert / Command
                                                       |
                                       Gateway -> PLC -> Machine

## Multi-Tenancy

Each tenant = one Durable Object.
Isolation: separate D1, DO state, API keys, audit log.
Sharding: if tenant exceeds DO limits, shard by machine group.

## Security

- API keys per tenant (SHA-256 hashed)
- Rate limits per tenant
- Kill switch global + tenant level
- All commands signed and logged
