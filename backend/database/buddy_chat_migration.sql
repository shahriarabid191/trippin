-- =============================================================
-- Buddy Chat Migration
-- Run this manually on your Supabase PostgreSQL instance.
-- =============================================================

-- Messages between two accepted travel buddies
CREATE TABLE IF NOT EXISTS buddy_messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index so fetching a conversation between two users is fast
CREATE INDEX IF NOT EXISTS buddy_messages_convo_idx
  ON buddy_messages (
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at
  );

-- One emoji reaction per user per message (toggled on/off)
CREATE TABLE IF NOT EXISTS buddy_message_reactions (
  id         SERIAL PRIMARY KEY,
  message_id INTEGER     NOT NULL REFERENCES buddy_messages(id) ON DELETE CASCADE,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji      VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
