// favoriteService — favorites jadvali bilan ishlash.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Film foydalanuvchining sevimlilarida bor-yo'qligini tekshiradi.
 * @param {number} userInternalId - users.id
 * @param {number} movieId
 * @returns {Promise<boolean>}
 */
async function isFavorite(userInternalId, movieId) {
  if (!userInternalId) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userInternalId)
    .eq('movie_id', movieId)
    .maybeSingle();

  if (error) {
    logger.error(`isFavorite xatosi (user: ${userInternalId}, movie: ${movieId}):`, error);
    return false;
  }

  return Boolean(data);
}

/**
 * Filmni sevimlilarga qo'shadi.
 * @param {number} userInternalId
 * @param {number} movieId
 * @returns {Promise<boolean>} muvaffaqiyatli bo'lsa true
 */
async function addFavorite(userInternalId, movieId) {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userInternalId, movie_id: movieId });

  if (error) {
    logger.error(`addFavorite xatosi (user: ${userInternalId}, movie: ${movieId}):`, error);
    return false;
  }

  return true;
}

/**
 * Filmni sevimlilardan olib tashlaydi.
 * @param {number} userInternalId
 * @param {number} movieId
 * @returns {Promise<boolean>} muvaffaqiyatli bo'lsa true
 */
async function removeFavorite(userInternalId, movieId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userInternalId)
    .eq('movie_id', movieId);

  if (error) {
    logger.error(`removeFavorite xatosi (user: ${userInternalId}, movie: ${movieId}):`, error);
    return false;
  }

  return true;
}

/**
 * Foydalanuvchining sevimli filmlarini (film ma'lumotlari bilan birga) qaytaradi.
 * @param {number} userInternalId
 * @returns {Promise<object[]>}
 */
async function getUserFavorites(userInternalId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, movies(*)')
    .eq('user_id', userInternalId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error(`getUserFavorites xatosi (user: ${userInternalId}):`, error);
    return [];
  }

  // Supabase join natijasidan faqat film obyektlarini ajratib olamiz.
  return (data || []).map((row) => row.movies).filter(Boolean);
}

module.exports = { isFavorite, addFavorite, removeFavorite, getUserFavorites };
