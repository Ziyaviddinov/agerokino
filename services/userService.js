// userService — users jadvali bilan ishlash uchun abstraction layer.
// Bot va admin panel to'g'ridan-to'g'ri Supabase so'rovlarini yozmaydi,
// har doim shu servis orqali murojaat qiladi. Bu keyinchalik database'ni
// almashtirish yoki logikani o'zgartirishni osonlashtiradi.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Telegram ID bo'yicha foydalanuvchini topadi.
 * @param {number} telegramId
 * @returns {Promise<object|null>}
 */
async function findByTelegramId(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (error) {
    logger.error(`findByTelegramId xatosi (telegram_id: ${telegramId}):`, error);
    return null;
  }

  return data;
}

/**
 * Yangi foydalanuvchi yaratadi.
 * @param {{telegram_id: number, username: string|null, first_name: string|null}} userInfo
 * @returns {Promise<object|null>}
 */
async function createUser(userInfo) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      telegram_id: userInfo.telegram_id,
      username: userInfo.username || null,
      first_name: userInfo.first_name || null,
    })
    .select()
    .single();

  if (error) {
    logger.error(`createUser xatosi (telegram_id: ${userInfo.telegram_id}):`, error);
    return null;
  }

  logger.info(`Yangi foydalanuvchi ro'yxatdan o'tdi: ${userInfo.telegram_id}`);
  return data;
}

/**
 * Foydalanuvchining last_active va (o'zgargan bo'lsa) username/first_name'ini yangilaydi.
 * @param {number} telegramId
 * @param {{username: string|null, first_name: string|null}} userInfo
 */
async function touchUser(telegramId, userInfo) {
  const { error } = await supabase
    .from('users')
    .update({
      last_active: new Date().toISOString(),
      username: userInfo.username || null,
      first_name: userInfo.first_name || null,
    })
    .eq('telegram_id', telegramId);

  if (error) {
    logger.error(`touchUser xatosi (telegram_id: ${telegramId}):`, error);
  }
}

/**
 * Foydalanuvchini topadi, mavjud bo'lmasa yaratadi, mavjud bo'lsa last_active'ni yangilaydi.
 * Telegram ctx.from obyektini qabul qiladi.
 * @param {{id: number, username?: string, first_name?: string}} from
 * @returns {Promise<object|null>} users jadvalidagi row (yoki DB xatosida null)
 */
async function registerOrUpdateUser(from) {
  const userInfo = {
    telegram_id: from.id,
    username: from.username || null,
    first_name: from.first_name || null,
  };

  const existing = await findByTelegramId(from.id);

  if (existing) {
    await touchUser(from.id, userInfo);
    return existing;
  }

  return createUser(userInfo);
}

module.exports = {
  findByTelegramId,
  createUser,
  touchUser,
  registerOrUpdateUser,
};
