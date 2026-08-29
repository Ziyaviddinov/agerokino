// movieFormat.js uchun testlar.
// Ishga tushirish: npm test

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatMovieCaption } = require('../utils/movieFormat');

test('formatMovieCaption — oddiy film uchun to\'g\'ri formatlaydi', () => {
  const movie = {
    title: 'avatar',
    type: 'movie',
    year: 2009,
    rating: 7.8,
    genre: 'Action, Adventure',
    duration: 162,
    description: 'Test tavsif',
  };

  const text = formatMovieCaption(movie);

  assert.match(text, /🎬 AVATAR/);
  assert.match(text, /📅 Yil: 2009/);
  assert.match(text, /⭐️ Reyting: 7\.8/);
  assert.match(text, /🎭 Janr: Action, Adventure/);
  assert.match(text, /⏱️ Davomiyligi: 162 daqiqa/);
  assert.match(text, /Test tavsif/);
});

test('formatMovieCaption — serial uchun davomiylikni ko\'rsatmaydi', () => {
  const movie = {
    title: 'stranger things',
    type: 'series',
    year: 2026,
    rating: 8.6,
    duration: null,
  };

  const text = formatMovieCaption(movie);

  assert.match(text, /📺 STRANGER THINGS/);
  assert.doesNotMatch(text, /Davomiyligi/);
});

test('formatMovieCaption — tavsif bo\'lmasa "Qisqacha" bo\'limini qo\'shmaydi', () => {
  const movie = { title: 'test film', type: 'movie' };
  const text = formatMovieCaption(movie);

  assert.doesNotMatch(text, /Qisqacha/);
});
