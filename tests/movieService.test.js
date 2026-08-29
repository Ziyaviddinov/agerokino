// movieService.js'dagi escapeIlike() funksiyasi uchun testlar.

const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeIlike } = require('../services/movieService');

test('escapeIlike — oddiy so\'zni o\'zgartirmaydi', () => {
  assert.equal(escapeIlike('avatar'), 'avatar');
});

test('escapeIlike — % belgisini ekranlaydi', () => {
  assert.equal(escapeIlike('50%'), '50\\%');
});

test('escapeIlike — _ belgisini ekranlaydi', () => {
  assert.equal(escapeIlike('a_b'), 'a\\_b');
});

test('escapeIlike — bir nechta maxsus belgini birdek ekranlaydi', () => {
  assert.equal(escapeIlike('%_%'), '\\%\\_\\%');
});
