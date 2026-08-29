// /removeadmin <telegram_id> — bot adminini o'chiradi. Faqat SUPER_ADMIN uchun.

const { isSuperAdmin, removeBotAdmin, getOwnerId } = require('../../services/adminService');

module.exports = async function removeAdminCommand(ctx) {
  const requesterId = ctx.from.id;

  const allowed = await isSuperAdmin(requesterId);
  if (!allowed) {
    return ctx.reply('⛔️ Bu buyruq faqat SUPER_ADMIN uchun.');
  }

  const parts = (ctx.message.text || '').trim().split(/\s+/);
  const targetId = parseInt(parts[1], 10);

  if (!parts[1] || Number.isNaN(targetId)) {
    return ctx.reply('❗️ To\'g\'ri formatda yozing:\n/removeadmin <telegram_id>');
  }

  if (targetId === getOwnerId()) {
    return ctx.reply('⛔️ Asosiy egasini (OWNER) o\'chirib bo\'lmaydi.');
  }

  const ok = await removeBotAdmin(targetId);
  if (!ok) {
    return ctx.reply('😕 Xatolik yuz berdi. Qayta urinib ko\'ring.');
  }

  await ctx.reply(`✅ Foydalanuvchi (ID: ${targetId}) adminlikdan olib tashlandi.`);
};
