// /help komandasi va "ℹ️ Yordam" tugmasi uchun umumiy javob.

const mainMenu = require('../keyboards/mainMenu');

const HELP_TEXT =
  'ℹ️ YORDAM\n\n' +
  '🔎 Kino qidirish — nom bo\'yicha film/serial toping\n' +
  '🔥 TOP kinolar — eng yuqori reytingli kinolar\n' +
  '🆕 Yangi qo\'shilganlar — so\'nggi qo\'shilgan kinolar\n' +
  '🎭 Janrlar — janr bo\'yicha ko\'rish\n' +
  '📺 Seriallar — serial bo\'limi\n' +
  '❤️ Sevimlilar — saqlangan filmlaringiz\n' +
  '🎯 Tavsiya — sizga mos kino tavsiya qilamiz\n\n' +
  'Savol yoki muammo bo\'lsa, admin bilan bog\'laning.';

async function helpCommand(ctx) {
  await ctx.reply(HELP_TEXT, mainMenu);
}

module.exports = helpCommand;
