// server/middleware/validateMovie.js uchun testlar.
// Bu Express middleware bo'lgani uchun req/res soxta (mock) obyektlar bilan sinaladi.

const test = require('node:test');
const assert = require('node:assert/strict');
const validateMovieInput = require('../server/middleware/validateMovie');

function mockReqRes(body) {
  const req = { body };
  const result = { statusCode: null, jsonBody: null, nextCalled: false };

  const res = {
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(payload) {
      result.jsonBody = payload;
      return this;
    },
  };

  const next = () => {
    result.nextCalled = true;
  };

  return { req, res, next, result };
}

test('validateMovieInput — bo\'sh nomni rad etadi', () => {
  const { req, res, next, result } = mockReqRes({ title: '' });
  validateMovieInput(req, res, next);

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
});

test('validateMovieInput — to\'g\'ri ma\'lumotni qabul qiladi va tozalaydi', () => {
  const { req, res, next, result } = mockReqRes({
    title: '  Avatar  ',
    year: '2009',
    rating: '7.8',
    type: 'movie',
  });

  validateMovieInput(req, res, next);

  assert.equal(result.nextCalled, true);
  assert.equal(req.validatedMovie.title, 'Avatar');
  assert.equal(req.validatedMovie.year, 2009);
  assert.equal(req.validatedMovie.rating, 7.8);
  assert.equal(req.validatedMovie.type, 'movie');
});

test('validateMovieInput — 0–10 oralig\'idan tashqari reytingni rad etadi', () => {
  const { req, res, next, result } = mockReqRes({ title: 'Test', rating: '15' });
  validateMovieInput(req, res, next);

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
});

test('validateMovieInput — noto\'g\'ri yilni rad etadi', () => {
  const { req, res, next, result } = mockReqRes({ title: 'Test', year: '3000' });
  validateMovieInput(req, res, next);

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
});

test('validateMovieInput — noma\'lum turni "movie"ga o\'zgartiradi', () => {
  const { req, res, next, result } = mockReqRes({ title: 'Test', type: 'cartoon' });
  validateMovieInput(req, res, next);

  assert.equal(result.nextCalled, true);
  assert.equal(req.validatedMovie.type, 'movie');
});
