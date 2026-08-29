-- ============================================================
-- KINOBOT — SEED DATA
-- Jadvallar yaratilgach (schema.sql), test uchun boshlang'ich
-- ma'lumotlarni qo'shish uchun shu faylni ishga tushiring.
-- ============================================================

-- ------------------------------------------------------------
-- Janrlar (bot menyusidagi 🎭 Janrlar bo'limi uchun)
-- ------------------------------------------------------------
INSERT INTO genres (name, slug) VALUES
  ('Action', 'action'),
  ('Comedy', 'comedy'),
  ('Romance', 'romance'),
  ('Horror', 'horror'),
  ('Fantasy', 'fantasy'),
  ('Sci-Fi', 'sci-fi'),
  ('Thriller', 'thriller'),
  ('Drama', 'drama'),
  ('Family', 'family'),
  ('Animation', 'animation')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- Test uchun bir nechta film/serial
-- ------------------------------------------------------------
INSERT INTO movies
  (title, alternative_title, description, year, genre, rating, duration, poster_url, trailer_url, watch_url, type, is_published)
VALUES
  (
    'Avatar', 'Avatar: The Way of Water',
    'Pandora sayyorasida yashovchi Na''vi xalqi haqidagi ajoyib fantastik sarguzasht.',
    2009, 'Action, Adventure, Fantasy', 7.8, 162,
    'https://example.com/posters/avatar.jpg',
    'https://youtube.com/watch?v=example1',
    'https://legal-streaming-example.com/avatar',
    'movie', true
  ),
  (
    'Stranger Things', NULL,
    'Kichik amerikacha shaharchada g''ayrioddiy voqealar ro''y bera boshlaydi.',
    2026, 'Drama, Horror, Sci-Fi', 8.6, NULL,
    'https://example.com/posters/stranger-things.jpg',
    'https://youtube.com/watch?v=example2',
    'https://legal-streaming-example.com/stranger-things',
    'series', true
  ),
  (
    'Interstellar', NULL,
    'Insoniyatni qutqarish uchun koinot bo''ylab sayohatga chiqqan astronavtlar haqida.',
    2014, 'Sci-Fi, Drama', 8.9, 169,
    'https://example.com/posters/interstellar.jpg',
    'https://youtube.com/watch?v=example3',
    'https://legal-streaming-example.com/interstellar',
    'movie', true
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- ESLATMA: admins jadvaliga yozuv qo'shish STEP 10 da,
-- alohida skript orqali qilinadi (parol bcrypt bilan hash qilinishi kerak,
-- shuning uchun uni to'g'ridan-to'g'ri SQL orqali yozish xavfsiz emas).
-- ============================================================
