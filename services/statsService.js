// statsService — admin panel uchun statistika hisoblaydi.
// STEP 13 da bu faylga ko'proq statistika (eng ko'p ko'rilganlar, grafiklar
// uchun vaqt bo'yicha ma'lumotlar) qo'shiladi.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

function startOfTodayISO() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

/**
 * Berilgan jadvaldagi qatorlar sonini hisoblaydi (kerak bo'lsa filter bilan).
 * @param {string} table
 * @param {(query: any) => any} [applyFilters]
 * @returns {Promise<number>}
 */
async function countRows(table, applyFilters) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (applyFilters) query = applyFilters(query);

  const { count, error } = await query;

  if (error) {
    logger.error(`countRows xatosi (${table}):`, error);
    return 0;
  }

  return count || 0;
}

/**
 * Dashboard uchun asosiy statistik ko'rsatkichlarni qaytaradi.
 * @returns {Promise<object>}
 */
async function getDashboardSummary() {
  const todayStart = startOfTodayISO();

  const [
    totalUsers,
    todayActiveUsers,
    totalMovies,
    totalSeries,
    todaySearches,
    totalFavorites,
  ] = await Promise.all([
    countRows('users'),
    countRows('users', (q) => q.gte('last_active', todayStart)),
    countRows('movies', (q) => q.eq('type', 'movie').eq('is_published', true)),
    countRows('movies', (q) => q.eq('type', 'series').eq('is_published', true)),
    countRows('searches', (q) => q.gte('created_at', todayStart)),
    countRows('favorites'),
  ]);

  return {
    totalUsers,
    todayActiveUsers,
    totalMovies,
    totalSeries,
    todaySearches,
    totalFavorites,
  };
}

/**
 * Oxirgi N kunlik yangi foydalanuvchilar sonini kun bo'yicha qaytaradi
 * (Dashboard'dagi o'sish grafigi uchun).
 * @param {number} days
 * @returns {Promise<{date: string, count: number}[]>}
 */
async function getUserGrowth(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('users')
    .select('joined_at')
    .gte('joined_at', since.toISOString());

  if (error) {
    logger.error('getUserGrowth xatosi:', error);
    return [];
  }

  // Har kun uchun 0 dan boshlab, keyin haqiqiy ma'lumot bilan to'ldiramiz.
  const counts = {};
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }

  (data || []).forEach((row) => {
    const key = (row.joined_at || '').slice(0, 10);
    if (counts[key] !== undefined) counts[key] += 1;
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

/**
 * Eng ko'p ko'rilgan filmlarni qaytaradi (17-band).
 * @param {number} limit
 * @returns {Promise<{movieId: number, title: string, views: number}[]>}
 */
async function getTopViewedMovies(limit = 5) {
  // Ko'p bo'lmagan (demo/o'rta o'lchamdagi) loyihalar uchun oddiy yondashuv:
  // views jadvalidan movie_id'larni olib, JavaScript'da hisoblaymiz.
  const { data, error } = await supabase.from('views').select('movie_id').limit(2000);

  if (error) {
    logger.error('getTopViewedMovies xatosi:', error);
    return [];
  }

  const counts = {};
  (data || []).forEach((row) => {
    counts[row.movie_id] = (counts[row.movie_id] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) return [];

  const ids = sorted.map(([id]) => Number(id));
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select('id, title')
    .in('id', ids);

  if (moviesError) {
    logger.error('getTopViewedMovies (movies so\'rovi) xatosi:', moviesError);
    return [];
  }

  const titleById = new Map((movies || []).map((m) => [m.id, m.title]));

  return sorted.map(([id, count]) => ({
    movieId: Number(id),
    title: titleById.get(Number(id)) || `#${id}`,
    views: count,
  }));
}

module.exports = { getDashboardSummary, getUserGrowth, getTopViewedMovies };
