// "❤️ Sevimlilar" tugmasi bosilganda foydalanuvchining saqlangan filmlarini ko'rsatadi.

const userService = require('../../services/userService');
const favoriteService = require('../../services/favoriteService');
const { movieResultsKeyboard } = require('../keyboards/movie');

async function favoritesCommand(ctx) {
  const user = await userService.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply('😕 Avval /start bosing.');
    return;
  }

  const favorites = await favoriteService.getUserFavorites(user.id);

  if (favorites.length === 0) {
    await ctx.reply('❤️ Sizda hali sevimli filmlar yo\'q.\n\nFilm sahifasida "❤️ Sevimlilarga qo\'shish" tugmasini bosing.');
    return;
  }

  await ctx.reply('❤️ Sizning sevimli filmlaringiz:', movieResultsKeyboard(favorites));
}

module.exports = favoritesCommand;
