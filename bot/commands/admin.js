// /admin komandasi — bot ichidagi admin menyusi.
// Faqat bot_admins jadvalida (yoki OWNER_TELEGRAM_ID) ro'yxatdan
// o'tgan foydalanuvchilarga ochiq.

const { Markup } = require('telegraf');
const { getAdminRole } = require('../../services/adminService');

module.exports = async function adminCommand(ctx) {
  const telegramId = ctx.from.id;
  const role = await getAdminRole(telegramId);

  if (!role) {
    return ctx.reply('⛔️ Sizda admin huquqi yo\'q.');
  }

  const buttons = [
    [Markup.button.callback('➕ Film qo\'shish', 'admin_add_movie')],
    [Markup.button.callback('📋 Filmlar ro\'yxati', 'admin_movies_list_1')],
  ];

  if (role === 'SUPER_ADMIN') {
    buttons.push([Markup.button.callback('👥 Adminlar', 'admin_list_admins')]);
  }

  await ctx.reply(
    `🛠 ADMIN MENYU\n\nSalom! Sizning rolingiz: ${role}\n\nQuyidagilardan birini tanlang:`,
    Markup.inlineKeyboard(buttons)
  );
};
