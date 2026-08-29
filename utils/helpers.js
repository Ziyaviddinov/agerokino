// Umumiy yordamchi funksiyalar.
// Hozircha faqat kanalga obuna tekshiruvi bor.
// Keyinchalik shu faylga boshqa umumiy funksiyalar ham qo'shiladi.

const logger = require('./logger');

/**
 * Foydalanuvchi kanalga obuna bo'lganmi yoki yo'qligini tekshiradi.
 * @param {import('telegraf').Telegram} telegram - ctx.telegram (Telegram API client)
 * @param {number} userId - Telegram user ID
 * @returns {Promise<boolean>}
 */
async function isSubscribed(telegram, userId) {
  const channelId = process.env.CHANNEL_ID;

  if (!channelId) {
    // Agar CHANNEL_ID sozlanmagan bo'lsa, obuna talabini o'chirib turamiz —
    // aks holda hech kim botdan foydalana olmay qoladi.
    logger.warn('CHANNEL_ID .env faylda topilmadi. Obuna tekshiruvi o\'tkazib yuborildi.');
    return true;
  }

  try {
    const member = await telegram.getChatMember(channelId, userId);
    // Telegram statuslari: creator, administrator, member, restricted, left, kicked
    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (error) {
    logger.error(`Obunani tekshirishda xatolik (user: ${userId}):`, error);
    // Xato bo'lsa, foydalanuvchini bloklamaslik uchun false qaytaramiz
    // va u "obuna bo'lmagan" holatida ko'radi — bu xavfsizroq variant.
    return false;
  }
}

module.exports = { isSubscribed };
