// Admin menyusidagi inline tugmalar uchun handler.
// Asosiy callbacks.js faylidan alohida saqlanadi — tartibli bo'lishi uchun.

const { Markup } = require('telegraf');
const { getAdminRole, listBotAdmins } = require('../../services/adminService');
const movieService = require('../../services/movieService');

const PAGE_SIZE = 10;

function formatAdminsList(admins, ownerId) {
  if (admins.length === 0 && !ownerId) {
    return '👥 Hozircha adminlar ro\'yxati bo\'sh.';
  }

  const lines = ['👥 BOT ADMINLARI:', ''];

  if (ownerId) {
    lines.push(`👑 ${ownerId} — SUPER_ADMIN (OWNER)`);
  }

  admins.forEach((a) => {
    lines.push(`• ${a.telegram_id} — ${a.role}${a.username ? ' (@' + a.username + ')' : ''}`);
  });

  return lines.join('\n');
}

function formatMoviesListText(movies, page, totalPages) {
  if (movies.length === 0) {
    return '📋 Filmlar topilmadi.';
  }
  const lines = [`📋 FILMLAR RO'YXATI (${page}/${totalPages})`, ''];
  movies.forEach((m) => {
    const status = m.is_published ? '🟢' : '⚪️';
    lines.push(`${status} #${m.id} — ${m.title} (${m.year || '—'})`);
  });
  return lines.join('\n');
}

function moviesListKeyboard(movies, page, totalPages) {
  const rows = movies.map((m) => [
    Markup.button.callback(`✏️ #${m.id} ${m.title}`, `admin_movie_edit_${m.id}`),
  ]);

  const nav = [];
  if (page > 1) nav.push(Markup.button.callback('⬅️', `admin_movies_list_${page - 1}`));
  nav.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) nav.push(Markup.button.callback('➡️', `admin_movies_list_${page + 1}`));
  rows.push(nav);

  rows.push([Markup.button.callback('⬅️ Admin menyuga qaytish', 'admin_menu_back')]);

  return Markup.inlineKeyboard(rows);
}

function registerAdminCallbacks(bot) {
  // Har bir admin action uchun umumiy: avval huquqni tekshiradi.
  async function requireAdmin(ctx) {
    const role = await getAdminRole(ctx.from.id);
    if (!role) {
      await ctx.answerCbQuery('⛔️ Sizda admin huquqi yo\'q.', { show_alert: true });
      return null;
    }
    return role;
  }

  bot.action('admin_list_admins', async (ctx) => {
    const role = await requireAdmin(ctx);
    if (!role) return;
    await ctx.answerCbQuery();

    const { getOwnerId } = require('../../services/adminService');
    const admins = await listBotAdmins();
    const text = formatAdminsList(admins, getOwnerId());

    await ctx.editMessageText(
      text,
      Markup.inlineKeyboard([[Markup.button.callback('⬅️ Admin menyuga qaytish', 'admin_menu_back')]])
    ).catch(async () => {
      await ctx.reply(text);
    });
  });

  bot.action(/admin_movies_list_(\d+)/, async (ctx) => {
    const role = await requireAdmin(ctx);
    if (!role) return;
    await ctx.answerCbQuery();

    const page = parseInt(ctx.match[1], 10) || 1;
    const { movies, totalPages } = await movieService.listMoviesAdmin({ page, pageSize: PAGE_SIZE });

    const text = formatMoviesListText(movies, page, totalPages);
    const keyboard = moviesListKeyboard(movies, page, totalPages);

    await ctx.editMessageText(text, keyboard).catch(async () => {
      await ctx.reply(text, keyboard);
    });
  });

  // Vaqtincha: film qo'shish "wizard"i keyingi bosqichda (B-bosqich) qo'shiladi.
  bot.action('admin_add_movie', async (ctx) => {
    const role = await requireAdmin(ctx);
    if (!role) return;
    await ctx.answerCbQuery();
    await ctx.reply('🚧 Film qo\'shish funksiyasi keyingi bosqichda qo\'shiladi.');
  });

  bot.action('admin_menu_back', async (ctx) => {
    const role = await requireAdmin(ctx);
    if (!role) return;
    await ctx.answerCbQuery();

    const buttons = [
      [Markup.button.callback('➕ Film qo\'shish', 'admin_add_movie')],
      [Markup.button.callback('📋 Filmlar ro\'yxati', 'admin_movies_list_1')],
    ];
    if (role === 'SUPER_ADMIN') {
      buttons.push([Markup.button.callback('👥 Adminlar', 'admin_list_admins')]);
    }

    await ctx
      .editMessageText(
        `🛠 ADMIN MENYU\n\nSizning rolingiz: ${role}\n\nQuyidagilardan birini tanlang:`,
        Markup.inlineKeyboard(buttons)
      )
      .catch(async () => {
        await ctx.reply('🛠 ADMIN MENYU', Markup.inlineKeyboard(buttons));
      });
  });
}

module.exports = registerAdminCallbacks;
