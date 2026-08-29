// Inline tugmalar (callback_query) uchun umumiy handler.
// Bu yerda: obunani tekshirish, film sahifasini ko'rsatish,
// "orqaga" va sevimlilar (hozircha placeholder) callback'lari bor.

const { isSubscribed } = require('../../utils/helpers');
const { formatMovieCaption } = require('../../utils/movieFormat');
const subscribeKeyboard = require('../keyboards/subscribe');
const mainMenu = require('../keyboards/mainMenu');
const genresKeyboard = require('../keyboards/genres');
const { movieDetailKeyboard, genreResultsKeyboard } = require('../keyboards/movie');
const movieService = require('../../services/movieService');
const genreService = require('../../services/genreService');
const favoriteService = require('../../services/favoriteService');
const userService = require('../../services/userService');
const logger = require('../../utils/logger');

const WELCOME_TEXT =
  '🎬 KINOBOT\n\n' +
  'Assalomu alaykum!\n\n' +
  'Bu yerda sevimli filmlaringizni\n' +
  'tez va qulay topishingiz mumkin.\n\n' +
  'Quyidagi menyudan foydalaning 👇';

const CAPTION_LIMIT = 1024; // Telegram photo caption cheklovi

function registerCallbacks(bot) {
  bot.action('check_subscription', async (ctx) => {
    const userId = ctx.from.id;
    const subscribed = await isSubscribed(ctx.telegram, userId);

    if (!subscribed) {
      await ctx.answerCbQuery('❌ Siz hali obuna bo\'lmadingiz.', { show_alert: true });
      return;
    }

    await ctx.answerCbQuery('✅ Obuna tasdiqlandi!');
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(WELCOME_TEXT, mainMenu);
  });

  // Qidiruv natijasidan (yoki keyingi bosqichlarda TOP/Janrlar ro'yxatidan)
  // film tanlanganda to'liq sahifani ko'rsatadi.
  bot.action(/^movie:(\d+)$/, async (ctx) => {
    const movieId = Number(ctx.match[1]);
    const movie = await movieService.getMovieById(movieId);

    if (!movie) {
      await ctx.answerCbQuery('😕 Film topilmadi.', { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();

    // Ko'rishni statistika uchun yozib qo'yamiz (xato bo'lsa ham sahifa ko'rsatiladi).
    const user = await userService.findByTelegramId(ctx.from.id);
    await movieService.logView(user ? user.id : null, movie.id);

    const isFav = user ? await favoriteService.isFavorite(user.id, movie.id) : false;

    const caption = formatMovieCaption(movie);
    const keyboard = movieDetailKeyboard(movie, isFav);

    if (movie.poster_url) {
      try {
        if (caption.length <= CAPTION_LIMIT) {
          await ctx.replyWithPhoto(movie.poster_url, { caption, ...keyboard });
        } else {
          // Caption juda uzun bo'lsa, avval rasm, keyin matn alohida yuboriladi.
          await ctx.replyWithPhoto(movie.poster_url);
          await ctx.reply(caption, keyboard);
        }
        return;
      } catch (error) {
        logger.warn(`Poster yuborilmadi (movie ${movie.id}), o'rniga matn yuborildi.`);
      }
    }

    await ctx.reply(caption, keyboard);
  });

  // "⬅️ Orqaga" — asosiy menyuga qaytaradi.
  bot.action('back_to_menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(WELCOME_TEXT, mainMenu);
  });

  // Sevimlilarga qo'shish/olib tashlash (toggle).
  bot.action(/^fav:(\d+)$/, async (ctx) => {
    const movieId = Number(ctx.match[1]);
    const user = await userService.findByTelegramId(ctx.from.id);

    if (!user) {
      // Odatda bo'lmaydi, chunki /start da ro'yxatdan o'tkaziladi — ehtiyot chorasi.
      await ctx.answerCbQuery('😕 Avval /start bosing.', { show_alert: true });
      return;
    }

    const movie = await movieService.getMovieById(movieId);
    if (!movie) {
      await ctx.answerCbQuery('😕 Film topilmadi.', { show_alert: true });
      return;
    }

    const currentlyFavorite = await favoriteService.isFavorite(user.id, movieId);

    let ok;
    if (currentlyFavorite) {
      ok = await favoriteService.removeFavorite(user.id, movieId);
    } else {
      ok = await favoriteService.addFavorite(user.id, movieId);
    }

    if (!ok) {
      await ctx.answerCbQuery('😕 Xatolik yuz berdi, qayta urinib ko\'ring.', { show_alert: true });
      return;
    }

    const nowFavorite = !currentlyFavorite;
    await ctx.answerCbQuery(nowFavorite ? '❤️ Sevimlilarga qo\'shildi' : '💔 Sevimlilardan olib tashlandi');

    // Faqat tugmalarni yangilaymiz — rasm/matn qayta yuborilmaydi.
    await ctx.editMessageReplyMarkup(movieDetailKeyboard(movie, nowFavorite).reply_markup).catch(() => {});
  });

  // Janr tanlanganda yoki pagination tugmasi (⬅️/➡️) bosilganda.
  bot.action(/^genre:([a-z0-9-]+):(\d+)$/, async (ctx) => {
    const slug = ctx.match[1];
    const page = Number(ctx.match[2]);

    const genre = await genreService.getGenreBySlug(slug);
    if (!genre) {
      await ctx.answerCbQuery('😕 Janr topilmadi.', { show_alert: true });
      return;
    }

    const { movies, totalPages } = await movieService.getMoviesByGenre(genre.name, page);
    await ctx.answerCbQuery();

    if (movies.length === 0) {
      await ctx.editMessageText(`😕 "${genre.name}" janrida hozircha film yo'q.`).catch(() => {
        ctx.reply(`😕 "${genre.name}" janrida hozircha film yo'q.`);
      });
      return;
    }

    const text = `🎭 ${genre.name} — filmlar:`;
    const keyboard = genreResultsKeyboard(movies, slug, page, totalPages);

    // Agar bu pagination bosilishi bo'lsa, xabarni tahrirlaymiz (yangi xabar yubormaymiz).
    await ctx.editMessageText(text, keyboard).catch(async () => {
      await ctx.reply(text, keyboard);
    });
  });

  // "🎭 Janrlarga qaytish" — janr ro'yxatiga qaytaradi.
  bot.action('genres_menu', async (ctx) => {
    await ctx.answerCbQuery();
    const genres = await genreService.getAllGenres();
    await ctx.editMessageText('🎭 Janrni tanlang:', genresKeyboard(genres)).catch(async () => {
      await ctx.reply('🎭 Janrni tanlang:', genresKeyboard(genres));
    });
  });

  // Sahifa raqami tugmasi (masalan "2/5") — bosilganda hech narsa qilmaydi.
  bot.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
  });
}

module.exports = registerCallbacks;
