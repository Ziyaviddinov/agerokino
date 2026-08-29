// Film sahifasini ko'rsatish uchun umumiy funksiya.
// bot/handlers/callbacks.js (tugma orqali) va bot/handlers/messages.js
// (kino kodi orqali) — ikkalasi ham shu yerdan foydalanadi, kod
// takrorlanmasligi uchun.

const { formatMovieCaption } = require('../../utils/movieFormat');
const { movieDetailKeyboard } = require('../keyboards/movie');
const movieService = require('../../services/movieService');
const favoriteService = require('../../services/favoriteService');
const userService = require('../../services/userService');
const logger = require('../../utils/logger');

const CAPTION_LIMIT = 1024; // Telegram photo caption cheklovi

/**
 * Film sahifasini (poster + ma'lumot + tugmalar) chiqaradi.
 * @param {import('telegraf').Context} ctx
 * @param {object} movie - movies jadvalidan olingan qator
 */
async function sendMovieDetail(ctx, movie) {
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
        await ctx.replyWithPhoto(movie.poster_url);
        await ctx.reply(caption, keyboard);
      }
      return;
    } catch (error) {
      logger.warn(`Poster yuborilmadi (movie ${movie.id}), o'rniga matn yuborildi.`);
    }
  }

  await ctx.reply(caption, keyboard);
}

module.exports = { sendMovieDetail };
