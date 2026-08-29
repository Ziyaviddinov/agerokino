// /start komandasi.
// Tartib (prompt talabiga ko'ra): 1) foydalanuvchini DB'ga ro'yxatdan o'tkazish/yangilash,
// 2) kanalga obuna tekshiruvi, 3) asosiy menyuni ko'rsatish.

const { isSubscribed } = require('../../utils/helpers');
const subscribeKeyboard = require('../keyboards/subscribe');
const mainMenu = require('../keyboards/mainMenu');
const userService = require('../../services/userService');
const logger = require('../../utils/logger');

const WELCOME_TEXT =
  '🎬 KINOBOT\n\n' +
  'Assalomu alaykum!\n\n' +
  'Bu yerda sevimli filmlaringizni\n' +
  'tez va qulay topishingiz mumkin.\n\n' +
  'Quyidagi menyudan foydalaning 👇';

const SUBSCRIBE_TEXT =
  '📢 Botdan foydalanish uchun avval kanalimizga obuna bo\'ling.';

async function startCommand(ctx) {
  const userId = ctx.from.id;

  // Foydalanuvchini DB'ga yozamiz/yangilaymiz.
  // DB xato bersa ham bot ishlashda davom etadi (userService ichida log qilinadi).
  await userService.registerOrUpdateUser(ctx.from);

  const subscribed = await isSubscribed(ctx.telegram, userId);

  if (!subscribed) {
    await ctx.reply(SUBSCRIBE_TEXT, subscribeKeyboard());
    return;
  }

  logger.info(`Foydalanuvchi /start bosdi: ${userId}`);
  await ctx.reply(WELCOME_TEXT, mainMenu);
}

module.exports = startCommand;
