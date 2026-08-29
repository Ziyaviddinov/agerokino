// "🔎 Kino qidirish" tugmasi bosilganda ishga tushadi.
// Foydalanuvchidan film nomini so'raydi va "qidiruv kutilmoqda" holatini yoqadi.
// Haqiqiy qidiruv keyingi matn xabarida handlers/messages.js orqali amalga oshadi.

const { setAwaitingSearch } = require('../state/searchState');

async function searchCommand(ctx) {
  setAwaitingSearch(ctx.from.id);
  await ctx.reply('🔎 Kino nomini yozing:');
}

module.exports = searchCommand;
