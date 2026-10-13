CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  max_machines INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  features TEXT
);
INSERT OR IGNORE INTO plans VALUES
  ('free', 'Free', 0, 3, 2, '["1 gateway","rules engine","Meri advisor"]'),
  ('starter', 'Starter', 49, 25, 10, '["5 gateways","rules engine","Meri advisor","priority email"]'),
  ('growth', 'Growth', 199, 200, 50, '["25 gateways","rules engine","Meri advisor","realtime","audit export"]'),
  ('enterprise', 'Enterprise', 999, 9999, 9999, '["unlimited","SLA","on-prem gateway","dedicated support"]');

ALTER TABLE tenants ADD COLUMN plan_id TEXT DEFAULT 'free';
ALTER TABLE tenants ADD COLUMN trial_ends_at INTEGER;
ALTER TABLE tenants ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE tenants ADD COLUMN stripe_subscription_id TEXT;
