// Film/serial ma'lumotlarini foydalanuvchiga ko'rsatiladigan matn shakliga o'giradi.
// Bu funksiya kelajakda TOP kinolar, Janrlar, Sevimlilar bo'limlarida ham
// qayta ishlatiladi — shuning uchun alohida faylga chiqarilgan.

function formatMovieCaption(movie) {
  const icon = movie.type === 'series' ? '📺' : '🎬';
  const lines = [`${icon} ${movie.title.toUpperCase()}`, ''];

  if (movie.year) lines.push(`📅 Yil: ${movie.year}`);
  if (movie.country) lines.push(`🌍 Davlat: ${movie.country}`);
  if (movie.language) lines.push(`🗣 Til: ${movie.language}`);
  if (movie.rating) lines.push(`⭐️ Reyting: ${movie.rating}`);
  if (movie.genre) lines.push(`🎭 Janr: ${movie.genre}`);
  if (movie.type !== 'series' && movie.duration) {
    lines.push(`⏱️ Davomiyligi: ${movie.duration} daqiqa`);
  }

  if (movie.description) {
    lines.push('');
    lines.push('📝 Qisqacha:');
    lines.push(movie.description);
  }

  if (movie.hashtags) {
    lines.push('');
    lines.push(movie.hashtags);
  }

  lines.push('');
  lines.push(`🔑 Kino kodi: ${movie.id}`);

  return lines.join('\n');
}

module.exports = { formatMovieCaption };
