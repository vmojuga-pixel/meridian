-- Nothing new; api_keys table already in 0002.
-- Add onboarded_at to tenants for tracking.
ALTER TABLE tenants ADD COLUMN onboarded_at INTEGER;
