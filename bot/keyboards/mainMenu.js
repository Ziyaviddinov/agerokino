// Asosiy menyu klaviaturasi.
// Bu Reply Keyboard (pastki tugmalar) — foydalanuvchi doim ko'radi.

const { Markup } = require('telegraf');

const mainMenu = Markup.keyboard([
  ['🔎 Kino qidirish', '🔥 TOP kinolar'],
  ['🆕 Yangi qo\'shilganlar', '🎭 Janrlar'],
  ['📺 Seriallar', '❤️ Sevimlilar'],
  ['🎯 Menga kino tavsiya qil'],
  ['ℹ️ Yordam'],
]).resize();

module.exports = mainMenu;
