// "🎭 Janrlar" tugmasi bosilganda ishga tushadi.

const genreService = require('../../services/genreService');
const genresKeyboard = require('../keyboards/genres');

async function genresCommand(ctx) {
  const genres = await genreService.getAllGenres();

  if (genres.length === 0) {
    await ctx.reply('😕 Hozircha janrlar qo\'shilmagan.');
    return;
  }

  await ctx.reply('🎭 Janrni tanlang:', genresKeyboard(genres));
}

module.exports = genresCommand;
