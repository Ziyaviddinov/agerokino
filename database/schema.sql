-- ============================================================
-- KINOBOT — DATABASE SCHEMA
-- Supabase (PostgreSQL) uchun.
-- Bu faylni Supabase Dashboard → SQL Editor'da to'liq nusxalab,
-- "Run" tugmasini bosib ishga tushiring.
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS — bot foydalanuvchilari
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,       -- Telegram ID takrorlanmasin
  username TEXT,                             -- @username (bo'lmasligi mumkin)
  first_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- ------------------------------------------------------------
-- 2. GENRES — janrlar ro'yxati (menyu tugmalari uchun)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,                 -- masalan: "Action"
  slug TEXT NOT NULL UNIQUE                  -- masalan: "action" (callback_data uchun)
);

-- ------------------------------------------------------------
-- 3. MOVIES — filmlar va seriallar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  alternative_title TEXT,                    -- masalan: original nomi
  description TEXT,
  year INTEGER,
  genre TEXT,                                -- vergul bilan: "Action, Adventure, Fantasy"
  rating NUMERIC(3,1) DEFAULT 0,             -- masalan: 7.8
  duration INTEGER,                          -- daqiqalarda
  poster_url TEXT,
  trailer_url TEXT,
  watch_url TEXT,                            -- QONUNIY tomosha manbasiga havola
  country TEXT,                              -- masalan: Yaponiya, AQSH
  language TEXT,                             -- masalan: o'zbek tilida, subtitr
  hashtags TEXT,                             -- masalan: #drama #2024
  type TEXT NOT NULL DEFAULT 'movie'
    CHECK (type IN ('movie', 'series')),
  is_published BOOLEAN NOT NULL DEFAULT true, -- admin "Hide" qilsa false bo'ladi
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Qidiruv va filtrlash tez ishlashi uchun indexlar
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies USING gin (to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_movies_alt_title ON movies USING gin (to_tsvector('simple', coalesce(alternative_title, '')));
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_published ON movies(is_published);

-- movies.updated_at avtomatik yangilanishi uchun trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movies_updated_at ON movies;
CREATE TRIGGER trg_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 4. FAVORITES — foydalanuvchi sevimli filmlari
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)                 -- bitta film 2 marta qo'shilmasin
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON favorites(movie_id);

-- ------------------------------------------------------------
-- 5. ADMINS — admin panel foydalanuvchilari
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- bcrypt hash, hech qachon oddiy parol emas
  role TEXT NOT NULL DEFAULT 'ADMIN'
    CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')), -- STEP 25 uchun tayyor
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 5b. BOT_ADMINS — Telegram ID orqali botni boshqaradigan adminlar
--     (web admin panel uchun ishlatiladigan "admins" jadvalidan alohida)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_admins (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN'
    CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')),
  added_by BIGINT,                            -- kim qo'shgani (telegram_id)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_admins_telegram_id ON bot_admins(telegram_id);

-- ------------------------------------------------------------
-- 6. SEARCHES — qidiruv statistikasi uchun
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS searches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);

-- ------------------------------------------------------------
-- 7. VIEWS — qaysi film ko'p ko'rilganini hisoblash uchun
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS views (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_views_movie_id ON views(movie_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON views(created_at DESC);

-- ============================================================
-- TAYYOR. Jadvallar: users, genres, movies, favorites,
-- admins, searches, views.
-- ============================================================
