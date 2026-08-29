// Qidiruv natijalari uchun Inline Keyboard.
// Har bir film alohida tugma, bosilganda "movie:<id>" callback keladi.

const { Markup } = require('telegraf');

function movieResultsKeyboard(movies) {
  const buttons = movies.map((movie) => [
    Markup.button.callback(
      `🎬 ${movie.title}${movie.year ? ` (${movie.year})` : ''}`,
      `movie:${movie.id}`
    ),
  ]);

  return Markup.inlineKeyboard(buttons);
}

// Film sahifasidagi tugmalar: Treyler / Sevimlilarga qo'shish (yoki olib tashlash) / Tomosha qilish / Orqaga.
// Treyler va Watch tugmalari faqat mos URL mavjud bo'lsagina ko'rsatiladi.
function movieDetailKeyboard(movie, isFavorite = false) {
  const rows = [];

  if (movie.trailer_url) {
    rows.push([Markup.button.url('🎞 Treyler', movie.trailer_url)]);
  }

  const favLabel = isFavorite ? '💔 Sevimlilardan olib tashlash' : '❤️ Sevimlilarga qo\'shish';
  rows.push([Markup.button.callback(favLabel, `fav:${movie.id}`)]);

  if (movie.watch_url) {
    rows.push([Markup.button.url('🔗 Qonuniy tomosha qilish', movie.watch_url)]);
  }

  rows.push([Markup.button.callback('⬅️ Orqaga', 'back_to_menu')]);

  return Markup.inlineKeyboard(rows);
}

// Janr bo'yicha filmlar ro'yxati + pagination (⬅️ 1/10 ➡️).
function genreResultsKeyboard(movies, slug, page, totalPages) {
  const rows = movies.map((movie) => [
    Markup.button.callback(
      `🎬 ${movie.title}${movie.year ? ` (${movie.year})` : ''}`,
      `movie:${movie.id}`
    ),
  ]);

  const navRow = [];
  if (page > 1) {
    navRow.push(Markup.button.callback('⬅️', `genre:${slug}:${page - 1}`));
  }
  navRow.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) {
    navRow.push(Markup.button.callback('➡️', `genre:${slug}:${page + 1}`));
  }
  rows.push(navRow);

  rows.push([Markup.button.callback('🎭 Janrlarga qaytish', 'genres_menu')]);

  return Markup.inlineKeyboard(rows);
}

// TOP kinolar ro'yxati — har bir tugmada reyting va o'rin raqami ko'rsatiladi.
function topResultsKeyboard(movies) {
  const rows = movies.map((movie, index) => [
    Markup.button.callback(
      `${index + 1}. 🎬 ${movie.title} ⭐️ ${movie.rating}`,
      `movie:${movie.id}`
    ),
  ]);

  return Markup.inlineKeyboard(rows);
}

module.exports = { movieResultsKeyboard, movieDetailKeyboard, genreResultsKeyboard, topResultsKeyboard };
