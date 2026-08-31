-- =====================================================================
-- 001_admin_panel.sql
--
-- Additive schema changes for the unified Admin Management Panel.
-- Every statement is guarded with IF NOT EXISTS / IF EXISTS so it is
-- safe to run more than once. No tables are created or dropped — only
-- nullable columns (and a couple of defaulted booleans) are added to
-- tables that already exist.
--
-- Apply against Supabase once before starting the backend with the
-- admin routes enabled:
--
--   psql "$DATABASE_URL" -f backend/database/migrations/001_admin_panel.sql
--
-- or paste it into the Supabase SQL editor.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- users — suspension (soft ban) + role tiers
-- role stays a plain varchar; allowed values are 'user' | 'moderator'
-- | 'admin' (enforced in application code, not a DB constraint, to
-- match the rest of this schema).
-- ---------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at   timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspend_reason text;

-- ---------------------------------------------------------------------
-- gallery_photos — moderation metadata (photo removal stays a hard
-- DELETE, matching the owner-delete behaviour already in the app).
-- ---------------------------------------------------------------------
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS flagged_at     timestamptz;
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS flag_reason    text;
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS unpublished_at timestamptz;
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS moderated_by   integer REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- reviews / guide_reviews / car_reviews — flag metadata
-- ---------------------------------------------------------------------
ALTER TABLE reviews       ADD COLUMN IF NOT EXISTS flagged_at   timestamptz;
ALTER TABLE reviews       ADD COLUMN IF NOT EXISTS flag_reason  text;
ALTER TABLE reviews       ADD COLUMN IF NOT EXISTS moderated_by integer REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE guide_reviews ADD COLUMN IF NOT EXISTS flagged_at   timestamptz;
ALTER TABLE guide_reviews ADD COLUMN IF NOT EXISTS flag_reason  text;
ALTER TABLE guide_reviews ADD COLUMN IF NOT EXISTS moderated_by integer REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE car_reviews   ADD COLUMN IF NOT EXISTS flagged_at   timestamptz;
ALTER TABLE car_reviews   ADD COLUMN IF NOT EXISTS flag_reason  text;
ALTER TABLE car_reviews   ADD COLUMN IF NOT EXISTS moderated_by integer REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- journals — moderation of PUBLIC entries only. Private journals
-- (is_public = false AND unpublished_at IS NULL) are never selected by
-- any admin query.
-- ---------------------------------------------------------------------
ALTER TABLE journals ADD COLUMN IF NOT EXISTS unpublished_at  timestamptz;
ALTER TABLE journals ADD COLUMN IF NOT EXISTS moderation_note text;
ALTER TABLE journals ADD COLUMN IF NOT EXISTS moderated_by    integer REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- hotels / guides / cars — activation toggle + a few catalogue fields
-- the admin listing editor exposes. Inactive inventory is hidden from
-- the public browse lists (see hotelController / guideModel / carModel).
-- ---------------------------------------------------------------------
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_active   boolean NOT NULL DEFAULT true;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS amenities   text;

ALTER TABLE guides ADD COLUMN IF NOT EXISTS is_active   boolean NOT NULL DEFAULT true;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS languages   text;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS specialties text;

ALTER TABLE cars   ADD COLUMN IF NOT EXISTS is_active   boolean NOT NULL DEFAULT true;
ALTER TABLE cars   ADD COLUMN IF NOT EXISTS provider    varchar;

-- ---------------------------------------------------------------------
-- bookings / car_bookings / guide_bookings — admin note on the row so
-- a cancel / refund can carry a reason.
-- ---------------------------------------------------------------------
ALTER TABLE bookings       ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE car_bookings   ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE guide_bookings ADD COLUMN IF NOT EXISTS admin_note text;

-- ---------------------------------------------------------------------
-- sos_alerts — admin incident lifecycle. Kept separate from the
-- existing receiver-facing `acked` / `acked_at` columns so the two
-- flows never clobber each other.
--   admin_status: NULL/'open' | 'acknowledged' | 'resolved'
-- The rows for one trigger (same sender_id + type + cntdown_end) are
-- treated as a single incident and updated together.
-- ---------------------------------------------------------------------
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS admin_status      varchar;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS admin_ack_at      timestamptz;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS admin_resolved_at timestamptz;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS admin_note        text;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS admin_handled_by  integer REFERENCES users(id) ON DELETE SET NULL;

-- Helpful indexes for the admin list queries (all IF NOT EXISTS).
CREATE INDEX IF NOT EXISTS users_created_at_idx        ON users (created_at);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx     ON bookings (created_at);
CREATE INDEX IF NOT EXISTS car_bookings_created_idx    ON car_bookings (created_at);
CREATE INDEX IF NOT EXISTS guide_bookings_created_idx  ON guide_bookings (created_at);
CREATE INDEX IF NOT EXISTS sos_alerts_admin_status_idx ON sos_alerts (admin_status);
CREATE INDEX IF NOT EXISTS gallery_photos_flagged_idx  ON gallery_photos (flagged_at);

COMMIT;
