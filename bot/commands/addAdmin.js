// /addadmin <telegram_id> [ROLE] — yangi bot adminini qo'shadi.
// Faqat SUPER_ADMIN ishlata oladi. ROLE berilmasa, "ADMIN" bo'ladi.
//
// Misol: /addadmin 123456789 ADMIN

const { isSuperAdmin, addBotAdmin, ROLES } = require('../../services/adminService');

module.exports = async function addAdminCommand(ctx) {
  const requesterId = ctx.from.id;

  const allowed = await isSuperAdmin(requesterId);
  if (!allowed) {
    return ctx.reply('⛔️ Bu buyruq faqat SUPER_ADMIN uchun.');
  }

  const parts = (ctx.message.text || '').trim().split(/\s+/);
  const targetIdRaw = parts[1];
  const roleRaw = (parts[2] || 'ADMIN').toUpperCase();

  const targetId = parseInt(targetIdRaw, 10);
  if (!targetIdRaw || Number.isNaN(targetId)) {
    return ctx.reply(
      '❗️ To\'g\'ri formatda yozing:\n/addadmin <telegram_id> [ROLE]\n\nMisol:\n/addadmin 123456789 ADMIN\n\nRuxsat etilgan rollar: ' +
        ROLES.join(', ')
    );
  }

  if (!ROLES.includes(roleRaw)) {
    return ctx.reply(`❗️ Noto'g'ri rol. Ruxsat etilgan rollar: ${ROLES.join(', ')}`);
  }

  const result = await addBotAdmin(targetId, roleRaw, requesterId);

  if (!result.ok) {
    return ctx.reply(`😕 ${result.error}`);
  }

  await ctx.reply(`✅ Foydalanuvchi (ID: ${targetId}) ${roleRaw} sifatida admin qilib qo'shildi.`);
};
