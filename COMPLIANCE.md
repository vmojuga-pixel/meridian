# EU AI Act Compliance

## Risk Category

High-Risk AI System (Annex III) when used in industrial safety contexts.

## Requirements & Implementation

| Requirement | Implementation |
|---|---|
| Human oversight | guardrail/human-override.js |
| Transparency | audit/log.js with reason field |
| Data governance | On-premise by default |
| Accuracy | Deterministic rules |
| Record-keeping | Immutable log to R2 |
| Risk management | Kill switch + rate limits |
| Technical documentation | This repo + docs/ |

## Guardrails

- Rate limit: max 1 command per 5s per machine
- Kill switch: POST /api/kill
- Human override: UI toggle
- Audit: all commands logged to R2
- Explainability: every decision has reason

## Data Sovereignty

- Default: data stays on-premise
- Sync: only summaries + events (opt-in)
- Raw data: never leaves factory unless owner exports

## LLM Usage

Meri (LLM) is advisory only:
- Cannot send commands
- Cannot change rules
- Can read summaries to generate reports
- All outputs marked AI-generated in UI

Ensures Meridian is not classified as a black box AI under Article 13.
