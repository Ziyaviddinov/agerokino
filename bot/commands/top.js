// "🔥 TOP kinolar" tugmasi bosilganda ishga tushadi.

const movieService = require('../../services/movieService');
const { topResultsKeyboard } = require('../keyboards/movie');

async function topCommand(ctx) {
  const movies = await movieService.getTopMovies();

  if (movies.length === 0) {
    await ctx.reply('😕 Hozircha filmlar mavjud emas.');
    return;
  }

  await ctx.reply('🔥 TOP KINOLAR', topResultsKeyboard(movies));
}

module.exports = topCommand;
