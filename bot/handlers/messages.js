// Menyu tugmalariga mos kelmagan barcha matn xabarlar shu yerga tushadi.
// Hozircha faqat bitta stsenariy bor: foydalanuvchi qidiruv natijasini kutyapti.
// Keyingi bosqichlarda bu yerga boshqa "kutilayotgan matn" holatlar ham qo'shilishi mumkin.

const { isAwaitingSearch, clearAwaitingSearch } = require('../state/searchState');
const movieService = require('../../services/movieService');
const userService = require('../../services/userService');
const { movieResultsKeyboard } = require('../keyboards/movie');

async function textHandler(ctx) {
  const telegramId = ctx.from.id;

  if (isAwaitingSearch(telegramId)) {
    clearAwaitingSearch(telegramId);

    const query = ctx.message.text.trim();

    // Statistika uchun qidiruvni yozib qo'yamiz (xato bo'lsa ham qidiruv davom etadi).
    const user = await userService.findByTelegramId(telegramId);
    await movieService.logSearch(user ? user.id : null, query);

    const results = await movieService.searchMovies(query);

    if (results.length === 0) {
      await ctx.reply(
        `😕 "${query}" bo'yicha hech narsa topilmadi.\nBoshqa nom bilan urinib ko'ring.`
      );
      return;
    }

    await ctx.reply(`🔎 "${query}" bo'yicha topilgan natijalar:`, movieResultsKeyboard(results));
    return;
  }

  // Hech qanday holatga mos kelmasa — standart javob.
  await ctx.reply('❓ Tushunmadim. Iltimos, menyudan foydalaning yoki /start bosing.');
}

module.exports = textHandler;
