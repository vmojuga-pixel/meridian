-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  email_verified INTEGER DEFAULT 0,
  verify_token TEXT,
  totp_secret TEXT,
  failed_attempts INTEGER DEFAULT 0,
  locked_until INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- API keys (for machine ingest)
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scope TEXT NOT NULL DEFAULT 'ingest:write',
  last_used INTEGER,
  revoked INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Machine models (catalog per tenant)
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  protocol TEXT,
  serial TEXT,
  status TEXT DEFAULT 'offline',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_machines_tenant ON machines(tenant_id);

-- Tenant factory details
ALTER TABLE tenants ADD COLUMN factory_name TEXT;
ALTER TABLE tenants ADD COLUMN country TEXT;
ALTER TABLE tenants ADD COLUMN industry TEXT;
ALTER TABLE tenants ADD COLUMN default_protocol TEXT;
ALTER TABLE tenants ADD COLUMN onboarded INTEGER DEFAULT 0;

-- Audit auth events
CREATE TABLE IF NOT EXISTS audit_auth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  tenant_id TEXT,
  event TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  meta TEXT,
  ts INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_auth_ts ON audit_auth(ts);
