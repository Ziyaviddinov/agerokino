// adminService — bot_admins jadvali bilan ishlash uchun.
// Bot ichidan (Telegram ID orqali) kim admin ekanini aniqlaydi.
//
// OWNER_TELEGRAM_ID (.env) — "bootstrap" super-admin. Bu ID doim SUPER_ADMIN
// hisoblanadi, database'da yozuv bo'lmasa ham — shunda birinchi admin
// hech qanday qo'shimcha sozlashsiz botdan foydalana oladi.

const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

function getOwnerId() {
  const raw = process.env.OWNER_TELEGRAM_ID;
  const id = raw ? parseInt(raw, 10) : null;
  return Number.isFinite(id) ? id : null;
}

/**
 * Foydalanuvchi bot admini ekanini va rolini tekshiradi.
 * @param {number} telegramId
 * @returns {Promise<string|null>} rol ('SUPER_ADMIN' | 'ADMIN' | 'EDITOR') yoki null
 */
async function getAdminRole(telegramId) {
  if (telegramId === getOwnerId()) {
    return 'SUPER_ADMIN';
  }

  const { data, error } = await supabase
    .from('bot_admins')
    .select('role')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (error) {
    logger.error(`getAdminRole xatosi (telegram_id: ${telegramId}):`, error);
    return null;
  }

  return data ? data.role : null;
}

async function isBotAdmin(telegramId) {
  const role = await getAdminRole(telegramId);
  return role !== null;
}

async function isSuperAdmin(telegramId) {
  const role = await getAdminRole(telegramId);
  return role === 'SUPER_ADMIN';
}

/**
 * Yangi bot adminini qo'shadi.
 * @param {number} telegramId
 * @param {string} role
 * @param {number} addedBy - qo'shgan adminning telegram_id'si
 */
async function addBotAdmin(telegramId, role, addedBy, username = null) {
  if (!ROLES.includes(role)) {
    return { ok: false, error: `Noto'g'ri rol. Ruxsat etilgan: ${ROLES.join(', ')}` };
  }

  const { data: existing } = await supabase
    .from('bot_admins')
    .select('id')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: 'Bu foydalanuvchi allaqachon admin.' };
  }

  const { error } = await supabase
    .from('bot_admins')
    .insert({ telegram_id: telegramId, role, added_by: addedBy, username });

  if (error) {
    logger.error(`addBotAdmin xatosi (telegram_id: ${telegramId}):`, error);
    return { ok: false, error: 'Database xatosi yuz berdi.' };
  }

  logger.info(`Yangi bot admin qo'shildi: ${telegramId} (${role})`);
  return { ok: true };
}

async function removeBotAdmin(telegramId) {
  const { error } = await supabase.from('bot_admins').delete().eq('telegram_id', telegramId);

  if (error) {
    logger.error(`removeBotAdmin xatosi (telegram_id: ${telegramId}):`, error);
    return false;
  }

  return true;
}

async function listBotAdmins() {
  const { data, error } = await supabase
    .from('bot_admins')
    .select('telegram_id, username, role, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('listBotAdmins xatosi:', error);
    return [];
  }

  return data || [];
}

module.exports = {
  ROLES,
  getOwnerId,
  getAdminRole,
  isBotAdmin,
  isSuperAdmin,
  addBotAdmin,
  removeBotAdmin,
  listBotAdmins,
};
