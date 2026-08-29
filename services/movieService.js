// movieService — movies (va bog'liq) jadvallar bilan ishlash uchun
// abstraction layer. Section 23 talabiga ko'ra: agar kelajakda tashqi
// movie API qo'shilsa, shu servis ichida almashtiriladi — bot/admin
// kodini o'zgartirish shart bo'lmaydi.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const SEARCH_RESULTS_LIMIT = 10;
const GENRE_PAGE_SIZE = 5;
const TOP_LIMIT = 10;
const NEW_LIMIT = 10;

// ILIKE naqshida % va _ maxsus ma'no anglatadi (masalan "%" har qanday matnga mos keladi).
// Foydalanuvchi shu belgilarni kiritsa ham, ular oddiy matn sifatida qidirilishi uchun ekranlanadi.
function escapeIlike(text) {
  return text.replace(/[%_]/g, '\\$&');
}

/**
 * Nom bo'yicha filmlarni qidiradi: title, alternative_title,
 * qisman mos kelish (partial) va katta-kichik harfga sezgir emas (case-insensitive).
 * @param {string} query
 * @returns {Promise<object[]>}
 */
async function searchMovies(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const safe = escapeIlike(trimmed);

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${safe}%,alternative_title.ilike.%${safe}%`)
    .order('rating', { ascending: false })
    .limit(SEARCH_RESULTS_LIMIT);

  if (error) {
    logger.error(`searchMovies xatosi (query: "${trimmed}"):`, error);
    return [];
  }

  return data || [];
}

/**
 * ID bo'yicha bitta filmni qaytaradi (faqat published bo'lsa).
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getMovieById(id) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    logger.error(`getMovieById xatosi (id: ${id}):`, error);
    return null;
  }

  return data;
}

/**
 * Qidiruv so'rovini statistika uchun `searches` jadvaliga yozadi.
 * @param {number|null} userInternalId - users.id (telegram_id emas!)
 * @param {string} query
 */
async function logSearch(userInternalId, query) {
  const { error } = await supabase
    .from('searches')
    .insert({ user_id: userInternalId || null, query });

  if (error) {
    logger.error(`logSearch xatosi (query: "${query}"):`, error);
  }
}

/**
 * Filmni ko'rishni statistika uchun `views` jadvaliga yozadi
 * (17-band: "eng ko'p ko'rilgan filmlar" uchun kerak).
 * @param {number|null} userInternalId - users.id (telegram_id emas!)
 * @param {number} movieId
 */
async function logView(userInternalId, movieId) {
  const { error } = await supabase
    .from('views')
    .insert({ user_id: userInternalId || null, movie_id: movieId });

  if (error) {
    logger.error(`logView xatosi (movie_id: ${movieId}):`, error);
  }
}

/**
 * Berilgan janr nomi bo'yicha filmlarni sahifalab (pagination) qaytaradi.
 * movies.genre ustuni vergul bilan ajratilgan matn bo'lgani uchun ILIKE ishlatiladi.
 * @param {string} genreName - masalan "Action"
 * @param {number} page - 1 dan boshlanadi
 * @returns {Promise<{movies: object[], total: number, totalPages: number}>}
 */
async function getMoviesByGenre(genreName, page = 1) {
  const from = (page - 1) * GENRE_PAGE_SIZE;
  const to = from + GENRE_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('movies')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .ilike('genre', `%${escapeIlike(genreName)}%`)
    .order('rating', { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`getMoviesByGenre xatosi (genre: "${genreName}"):`, error);
    return { movies: [], total: 0, totalPages: 1 };
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / GENRE_PAGE_SIZE));

  return { movies: data || [], total, totalPages };
}

/**
 * Reytingi eng yuqori filmlarni qaytaradi.
 * @returns {Promise<object[]>}
 */
async function getTopMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_published', true)
    .order('rating', { ascending: false })
    .limit(TOP_LIMIT);

  if (error) {
    logger.error('getTopMovies xatosi:', error);
    return [];
  }

  return data || [];
}

/**
 * Eng oxirgi qo'shilgan filmlarni qaytaradi (eng yangisi birinchi).
 * @returns {Promise<object[]>}
 */
async function getNewMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(NEW_LIMIT);

  if (error) {
    logger.error('getNewMovies xatosi:', error);
    return [];
  }

  return data || [];
}

/**
 * ID bo'yicha filmni qaytaradi — is_published holatidan qat'i nazar.
 * Faqat admin panel ishlatadi (bot foydalanuvchisi buni ko'rmasligi kerak).
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getMovieByIdAny(id) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.error(`getMovieByIdAny xatosi (id: ${id}):`, error);
    return null;
  }

  return data;
}

/**
 * Admin panel uchun filmlar ro'yxati — barcha holat (yashirin bo'lsa ham),
 * qidiruv va turi bo'yicha filtr, sahifalash bilan.
 * @param {{page?: number, pageSize?: number, search?: string, type?: string}} options
 */
async function listMoviesAdmin({ page = 1, pageSize = 10, search = '', type = '' } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('movies')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    const safe = escapeIlike(search);
    query = query.or(`title.ilike.%${safe}%,alternative_title.ilike.%${safe}%`);
  }
  if (type === 'movie' || type === 'series') {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    logger.error('listMoviesAdmin xatosi:', error);
    return { movies: [], total: 0, totalPages: 1 };
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { movies: data || [], total, totalPages };
}

/**
 * Yangi film yaratadi.
 * @param {object} movieData
 * @returns {Promise<object|null>}
 */
async function createMovie(movieData) {
  const { data, error } = await supabase.from('movies').insert(movieData).select().single();

  if (error) {
    logger.error('createMovie xatosi:', error);
    return null;
  }

  logger.info(`Admin panel: yangi film qo'shildi — "${movieData.title}"`);
  return data;
}

/**
 * Mavjud filmni yangilaydi.
 * @param {number} id
 * @param {object} movieData
 * @returns {Promise<object|null>}
 */
async function updateMovie(id, movieData) {
  const { data, error } = await supabase
    .from('movies')
    .update(movieData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error(`updateMovie xatosi (id: ${id}):`, error);
    return null;
  }

  logger.info(`Admin panel: film yangilandi — id ${id}`);
  return data;
}

/**
 * Filmni butunlay o'chiradi.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function deleteMovie(id) {
  const { error } = await supabase.from('movies').delete().eq('id', id);

  if (error) {
    logger.error(`deleteMovie xatosi (id: ${id}):`, error);
    return false;
  }

  logger.info(`Admin panel: film o'chirildi — id ${id}`);
  return true;
}

/**
 * Filmni ko'rsatish/yashirish holatini o'zgartiradi (Hide/Show).
 * @param {number} id
 * @param {boolean} isPublished
 * @returns {Promise<object|null>}
 */
async function setPublished(id, isPublished) {
  const { data, error } = await supabase
    .from('movies')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error(`setPublished xatosi (id: ${id}):`, error);
    return null;
  }

  return data;
}

module.exports = {
  searchMovies,
  getMovieById,
  getMovieByIdAny,
  logSearch,
  logView,
  getMoviesByGenre,
  getTopMovies,
  getNewMovies,
  listMoviesAdmin,
  createMovie,
  updateMovie,
  deleteMovie,
  setPublished,
  escapeIlike,
};
