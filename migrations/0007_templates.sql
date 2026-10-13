CREATE TABLE IF NOT EXISTS rule_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  config TEXT NOT NULL,
  installs INTEGER DEFAULT 0,
  author TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO rule_templates (id, name, category, description, config, author) VALUES
  ('tpl_temp_critical', 'Temp critical shutdown', 'safety',
   'Trigger alert + slow machine when temp >= 95C',
   '{"metric":"temp","operator":"gte","threshold":95,"action":"alert","severity":"critical"}',
   'meridian'),

  ('tpl_temp_warn', 'Temp warning', 'safety',
   'Warn when temp >= 85C',
   '{"metric":"temp","operator":"gte","threshold":85,"action":"alert","severity":"warning"}',
   'meridian'),

  ('tpl_rpm_overspeed', 'RPM overspeed', 'safety',
   'Alert when RPM > 3500',
   '{"metric":"rpm","operator":"gt","threshold":3500,"action":"alert","severity":"critical"}',
   'meridian'),

  ('tpl_power_idle', 'Power idle cut', 'energy',
   'Alert when idle power > 5kW',
   '{"metric":"power","operator":"gt","threshold":5,"action":"alert","severity":"info"}',
   'meridian'),

  ('tpl_power_spike', 'Power spike alert', 'energy',
   'Alert when power > 50kW',
   '{"metric":"power","operator":"gt","threshold":50,"action":"alert","severity":"critical"}',
   'meridian');
