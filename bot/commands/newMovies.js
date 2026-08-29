// "🆕 Yangi qo'shilganlar" tugmasi bosilganda ishga tushadi.

const movieService = require('../../services/movieService');
const { movieResultsKeyboard } = require('../keyboards/movie');

async function newMoviesCommand(ctx) {
  const movies = await movieService.getNewMovies();

  if (movies.length === 0) {
    await ctx.reply('😕 Hozircha filmlar mavjud emas.');
    return;
  }

  await ctx.reply('🆕 YANGI QO\'SHILGANLAR', movieResultsKeyboard(movies));
}

module.exports = newMoviesCommand;
