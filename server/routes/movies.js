// Admin panel uchun Filmlar CRUD API'si.
// Barcha route'lar login talab qiladi; qo'shish/tahrirlash/yashirish uchun
// kamida EDITOR, o'chirish uchun kamida ADMIN roli kerak (25-band).

const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const validateMovieInput = require('../middleware/validateMovie');
const movieService = require('../../services/movieService');
const logger = require('../../utils/logger');

const router = express.Router();

const EDITORS = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
const ADMINS_ONLY = ['SUPER_ADMIN', 'ADMIN'];

router.use(authMiddleware); // shu fayldagi barcha route'lar login talab qiladi

// Ro'yxat (qidiruv + turi bo'yicha filtr + sahifalash)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const search = (req.query.search || '').toString();
  const type = (req.query.type || '').toString();

  try {
    const result = await movieService.listMoviesAdmin({ page, search, type });
    res.json(result);
  } catch (error) {
    logger.error('Filmlar ro\'yxatini olishda xatolik:', error);
    res.status(500).json({ error: 'Ichki server xatosi yuz berdi.' });
  }
});

// Bitta filmni olish (tahrirlash formasini to'ldirish uchun)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const movie = await movieService.getMovieByIdAny(id);

  if (!movie) {
    return res.status(404).json({ error: 'Film topilmadi.' });
  }

  res.json(movie);
});

// Yangi film qo'shish
router.post('/', requireRole(...EDITORS), validateMovieInput, async (req, res) => {
  const movie = await movieService.createMovie(req.validatedMovie);

  if (!movie) {
    return res.status(500).json({ error: 'Film yaratilmadi.' });
  }

  res.status(201).json(movie);
});

// Filmni tahrirlash
router.put('/:id', requireRole(...EDITORS), validateMovieInput, async (req, res) => {
  const id = Number(req.params.id);
  const movie = await movieService.updateMovie(id, req.validatedMovie);

  if (!movie) {
    return res.status(500).json({ error: 'Film yangilanmadi.' });
  }

  res.json(movie);
});

// Ko'rsatish/yashirish (Hide/Show)
router.patch('/:id/visibility', requireRole(...EDITORS), async (req, res) => {
  const id = Number(req.params.id);
  const isPublished = Boolean(req.body.is_published);

  const movie = await movieService.setPublished(id, isPublished);

  if (!movie) {
    return res.status(500).json({ error: 'Holat yangilanmadi.' });
  }

  res.json(movie);
});

// O'chirish (faqat ADMIN va SUPER_ADMIN)
router.delete('/:id', requireRole(...ADMINS_ONLY), async (req, res) => {
  const id = Number(req.params.id);
  const ok = await movieService.deleteMovie(id);

  if (!ok) {
    return res.status(500).json({ error: 'Film o\'chirilmadi.' });
  }

  res.json({ success: true });
});

module.exports = router;
