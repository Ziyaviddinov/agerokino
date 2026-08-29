// Film qo'shish/tahrirlash uchun input validatsiyasi.
// Barcha matn maydonlari trim qilinadi, raqamlar to'g'ri turga o'giriladi
// va chegaradan tashqari qiymatlar rad etiladi (18-band: input validation).

const ALLOWED_TYPES = ['movie', 'series'];

function validateMovieInput(req, res, next) {
  const body = req.body || {};

  const title = (body.title || '').toString().trim();
  if (!title) {
    return res.status(400).json({ error: 'Film nomi majburiy.' });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: 'Film nomi juda uzun (200 belgidan kam bo\'lishi kerak).' });
  }

  const type = ALLOWED_TYPES.includes(body.type) ? body.type : 'movie';

  let year = null;
  if (body.year !== undefined && body.year !== '') {
    year = parseInt(body.year, 10);
    if (Number.isNaN(year) || year < 1888 || year > 2100) {
      return res.status(400).json({ error: 'Yil noto\'g\'ri (1888–2100 oralig\'ida bo\'lishi kerak).' });
    }
  }

  let rating = 0;
  if (body.rating !== undefined && body.rating !== '') {
    rating = parseFloat(body.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      return res.status(400).json({ error: 'Reyting 0 dan 10 gacha bo\'lishi kerak.' });
    }
  }

  let duration = null;
  if (body.duration !== undefined && body.duration !== '') {
    duration = parseInt(body.duration, 10);
    if (Number.isNaN(duration) || duration < 0 || duration > 1000) {
      return res.status(400).json({ error: 'Davomiylik noto\'g\'ri.' });
    }
  }

  req.validatedMovie = {
    title,
    alternative_title: (body.alternative_title || '').toString().trim() || null,
    description: (body.description || '').toString().trim() || null,
    year,
    genre: (body.genre || '').toString().trim() || null,
    rating,
    duration,
    poster_url: (body.poster_url || '').toString().trim() || null,
    trailer_url: (body.trailer_url || '').toString().trim() || null,
    watch_url: (body.watch_url || '').toString().trim() || null,
    type,
  };

  next();
}

module.exports = validateMovieInput;
