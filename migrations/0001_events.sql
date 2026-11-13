CREATE TABLE events (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  page TEXT,
  detail TEXT,
  country TEXT,
  ua_family TEXT,
  device_type TEXT
);

CREATE INDEX idx_events_ts ON events (ts);
CREATE INDEX idx_events_event ON events (event);
CREATE INDEX idx_events_session_ts ON events (session_id, ts);
