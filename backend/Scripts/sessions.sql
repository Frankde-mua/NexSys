-- Optional: the API creates this table automatically on first use.
-- Run per company database if you prefer to create it yourself.
CREATE TABLE IF NOT EXISTS sessions (
  id                TEXT PRIMARY KEY,
  username          VARCHAR(50) NOT NULL,
  client            JSONB,
  started_at        BIGINT NOT NULL,
  ended_at          BIGINT,
  last_activity_at  BIGINT NOT NULL,
  expires_at        BIGINT NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'recording',
  transcript        TEXT NOT NULL DEFAULT '',
  notes             TEXT NOT NULL DEFAULT '',
  invoiced          BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (username, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);
