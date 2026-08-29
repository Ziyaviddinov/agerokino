// Menyu tugmalariga mos kelmagan barcha matn xabarlar shu yerga tushadi.
// Stsenariylar (tartib bo'yicha tekshiriladi):
//   1. Admin "film qo'shish/tahrirlash" jarayonida (wizard)
//   2. Foydalanuvchi qidiruv natijasini kutyapti
//   3. Foydalanuvchi "kino kodi" (raqam) yubordi — masalan "42"
//   4. Hech biriga mos kelmasa — standart javob

const { isAwaitingSearch, clearAwaitingSearch } = require('../state/searchState');
const movieService = require('../../services/movieService');
const userService = require('../../services/userService');
const { movieResultsKeyboard } = require('../keyboards/movie');
const { handleAdminWizardText } = require('./adminWizard');
const { sendMovieDetail } = require('./movieDetail');

const MOVIE_CODE_PATTERN = /^\d{1,10}$/;

async function textHandler(ctx) {
  const telegramId = ctx.from.id;

  // 1. Admin "film qo'shish/tahrirlash" jarayonida bo'lsa, shu yerda tugaydi.
  const handledByAdminWizard = await handleAdminWizardText(ctx);
  if (handledByAdminWizard) return;

  // 2. Qidiruv natijasi kutilmoqda.
  if (isAwaitingSearch(telegramId)) {
    clearAwaitingSearch(telegramId);

    const query = ctx.message.text.trim();

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

  // 3. "Kino kodi" — foydalanuvchi faqat raqam yuborsa (masalan "42").
  const text = ctx.message.text.trim();
  if (MOVIE_CODE_PATTERN.test(text)) {
    const movieId = parseInt(text, 10);
    const movie = await movieService.getMovieById(movieId);

    if (!movie) {
      await ctx.reply(`😕 "${text}" kodli kino topilmadi. Kodni tekshirib qayta yuboring.`);
      return;
    }

    await sendMovieDetail(ctx, movie);
    return;
  }

  // 4. Hech qanday holatga mos kelmasa — standart javob.
  await ctx.reply('❓ Tushunmadim. Iltimos, menyudan foydalaning yoki /start bosing.');
}

module.exports = textHandler;
