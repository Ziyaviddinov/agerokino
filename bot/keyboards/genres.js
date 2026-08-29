// "🎭 Janrlar" bosilganda chiqadigan janr tugmalari.

const { Markup } = require('telegraf');

// Prompt'da ko'rsatilgan janr emojilari. Mos emoji topilmasa, standart 🎬 ishlatiladi.
const GENRE_EMOJI = {
  action: '🔫',
  comedy: '😂',
  romance: '❤️',
  horror: '👻',
  fantasy: '🧙',
  'sci-fi': '🚀',
  thriller: '🕵️',
  drama: '🎭',
  family: '👨‍👩‍👧',
  animation: '🧸',
};

function genresKeyboard(genres) {
  const rows = [];

  for (let i = 0; i < genres.length; i += 2) {
    const row = [genreButton(genres[i])];
    if (genres[i + 1]) row.push(genreButton(genres[i + 1]));
    rows.push(row);
  }

  return Markup.inlineKeyboard(rows);
}

function genreButton(genre) {
  const emoji = GENRE_EMOJI[genre.slug] || '🎬';
  return Markup.button.callback(`${emoji} ${genre.name}`, `genre:${genre.slug}:1`);
}

module.exports = genresKeyboard;
