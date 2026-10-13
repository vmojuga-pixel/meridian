-- New table: hourly aggregates (what cloud sees)
CREATE TABLE IF NOT EXISTS telemetry_agg (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  hour_bucket INTEGER NOT NULL,
  samples INTEGER DEFAULT 0,
  avg_temp REAL, max_temp REAL, min_temp REAL,
  avg_rpm REAL, max_rpm REAL, min_rpm REAL,
  avg_power REAL, max_power REAL, min_power REAL,
  status_summary TEXT,
  alerts_count INTEGER DEFAULT 0,
  commands_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agg_unique ON telemetry_agg(tenant_id, machine_id, hour_bucket);
CREATE INDEX IF NOT EXISTS idx_agg_tenant ON telemetry_agg(tenant_id, hour_bucket DESC);

-- Keep old telemetry table for legacy data; new ingest writes to telemetry_agg only
