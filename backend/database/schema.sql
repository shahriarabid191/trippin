-- AI itinerary builder: one persisted "current draft" per user.
CREATE TABLE IF NOT EXISTS itineraries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gallery: user-uploaded photos. Private = only the owner sees it in
-- "My Gallery"; public = also shown in the site-wide Gallery dome.
CREATE TABLE IF NOT EXISTS gallery_photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption VARCHAR(100) NOT NULL DEFAULT '',
  stored_name VARCHAR NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR,
  file_size INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One heart per user per photo (enforced by the UNIQUE constraint).
CREATE TABLE IF NOT EXISTS gallery_likes (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (photo_id, user_id)
);
