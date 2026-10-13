CREATE TABLE IF NOT EXISTS public_kb (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT,
  priority INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_kb_topic ON public_kb(topic);
CREATE INDEX IF NOT EXISTS idx_kb_priority ON public_kb(priority DESC);
