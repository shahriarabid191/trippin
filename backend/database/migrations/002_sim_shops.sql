-- =====================================================================
-- 002_sim_shops.sql
--
-- SIM / eSIM shop directory. Previously a static frontend file
-- (frontend/src/data/simShopsData.js) plus per-browser localStorage for
-- user-submitted shops. This makes it a real, admin-controlled table
-- with a submission -> approval lifecycle.
--
-- Apply once:
--   psql "$DATABASE_URL" -f backend/database/migrations/002_sim_shops.sql
-- (idempotent — safe to re-run)
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS sim_shops (
    id               SERIAL PRIMARY KEY,

    -- shop details (mirrors the objects in simShopsData.js)
    name             VARCHAR(150) NOT NULL,
    district         VARCHAR(80)  NOT NULL,
    area             VARCHAR(120) NOT NULL,
    address          TEXT         NOT NULL,
    landmark         TEXT,
    phone            VARCHAR(40)  NOT NULL,
    alt_phone        VARCHAR(40),
    email            VARCHAR(150),
    hours            VARCHAR(200) NOT NULL,
    established      VARCHAR(10),
    operators        TEXT[]       NOT NULL DEFAULT '{}',   -- e.g. {grameenphone,robi}
    services         TEXT[]       NOT NULL DEFAULT '{}',
    esim_support     BOOLEAN      NOT NULL DEFAULT false,
    map_link         TEXT,

    -- verification document uploaded with a user submission (real file
    -- in uploads/, same as the vault / gallery). Never exposed publicly.
    doc_stored_name  VARCHAR,
    doc_file_path    TEXT,

    -- moderation lifecycle
    status           VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    rejection_reason TEXT,
    reviewed_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at      TIMESTAMPTZ,

    -- provenance
    submitted_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- NULL = seeded / admin-created
    source           VARCHAR(20)  NOT NULL DEFAULT 'user',             -- seed | admin | user

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sim_shops_district_area_idx ON sim_shops (district, area);
CREATE INDEX IF NOT EXISTS sim_shops_status_idx        ON sim_shops (status);
CREATE INDEX IF NOT EXISTS sim_shops_submitted_by_idx  ON sim_shops (submitted_by);

COMMIT;
