ALTER TABLE users ADD COLUMN totp_enabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN totp_verified_at INTEGER;
ALTER TABLE users ADD COLUMN recovery_codes TEXT;
