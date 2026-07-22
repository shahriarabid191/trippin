-- =====================================================================
-- Migration for the Hotel Reviews + Payments/Booking features.
-- Run this once against your Supabase Postgres (SQL editor or psql).
--
-- Verified against the live schema: hotels.id is INTEGER (serial),
-- so hotel_id is INTEGER here with a real FK to hotels(id).
-- =====================================================================

-- ---------- Reviews ----------
CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    hotel_id    INTEGER     NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_email  VARCHAR(255) NOT NULL,
    rating      INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT        DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_hotel_id ON reviews (hotel_id);

-- ---------- Bookings ----------
CREATE TABLE IF NOT EXISTS bookings (
    id             SERIAL PRIMARY KEY,
    hotel_id       INTEGER     NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_email     VARCHAR(255) NOT NULL,
    check_in       DATE        NOT NULL,
    check_out      DATE        NOT NULL,
    total_amount   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    transaction_id TEXT,
    status         VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id   ON bookings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings (user_email);
