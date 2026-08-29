// genreService — genres jadvali bilan ishlash.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Barcha janrlarni nomi bo'yicha tartiblab qaytaradi.
 * @returns {Promise<object[]>}
 */
async function getAllGenres() {
  const { data, error } = await supabase.from('genres').select('*').order('name');

  if (error) {
    logger.error('getAllGenres xatosi:', error);
    return [];
  }

  return data || [];
}

/**
 * Slug bo'yicha bitta janrni topadi (masalan "action" -> { name: "Action", ... }).
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
async function getGenreBySlug(slug) {
  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    logger.error(`getGenreBySlug xatosi (slug: ${slug}):`, error);
    return null;
  }

  return data;
}

module.exports = { getAllGenres, getGenreBySlug };
