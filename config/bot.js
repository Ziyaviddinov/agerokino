// Bu fayl Telegraf bot instance'ini bir marta yaratadi.
// bot.js va boshqa handler fayllar shu instance'dan foydalanadi.

require('dotenv').config();
const { Telegraf } = require('telegraf');

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error('❌ BOT_TOKEN topilmadi. .env faylni tekshiring.');
}

const bot = new Telegraf(botToken);

module.exports = bot;
