-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Telemetry (raw)
CREATE TABLE IF NOT EXISTS telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  temp REAL,
  rpm REAL,
  power REAL,
  status TEXT,
  ts INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_telemetry_tenant_ts ON telemetry(tenant_id, ts);

-- Commands (outbound)
CREATE TABLE IF NOT EXISTS commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  action TEXT NOT NULL,
  value REAL,
  reason TEXT,
  rule_id TEXT,
  ts INTEGER DEFAULT (unixepoch())
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  severity TEXT,
  message TEXT,
  resolved INTEGER DEFAULT 0,
  ts INTEGER DEFAULT (unixepoch())
);

-- Rules registry (cached, primary in KV)
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  config TEXT NOT NULL,
  enabled INTEGER DEFAULT 1
);
