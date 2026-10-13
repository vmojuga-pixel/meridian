CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  token_hash TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  accepted_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_invites_tenant ON invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
