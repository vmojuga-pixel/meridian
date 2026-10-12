# API Reference

All tenant routes require header: `X-Tenant-ID: factory-001`

## POST /api/ingest

    {
      "machine_id": "press-01",
      "temp": 87.5,
      "rpm": 3020,
      "power": 12.4,
      "status": "running"
    }

Response:

    { "ok": true, "actions": [...] }

## GET /api/dashboard?tenant=factory-001

Returns aggregated stats: alerts, commands, machines.

## POST /api/commands

    {
      "machine_id": "press-01",
      "action": "set_speed",
      "value": 2700
    }

## POST /api/meri/chat

    { "message": "How did press-01 perform today?" }

Response:

    { "reply": "...", "advisory_only": true, "source": "meri" }

## POST /api/kill

Stops all rules. Requires admin key.

## GET /health

Returns: `{ status: "ok", ts: <epoch> }`
