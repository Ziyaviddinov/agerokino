// Birinchi admin foydalanuvchisini yaratish uchun bir martalik skript.
// .env faylidagi ADMIN_USERNAME va ADMIN_PASSWORD'ni o'qiydi,
// parolni bcrypt bilan hash qiladi va admins jadvaliga yozadi.
//
// Ishga tushirish: node scripts/createAdmin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const logger = require('../utils/logger');

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    logger.error('ADMIN_USERNAME yoki ADMIN_PASSWORD .env faylda topilmadi.');
    process.exit(1);
  }

  const { data: existing, error: findError } = await supabase
    .from('admins')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (findError) {
    logger.error('Adminni tekshirishda xatolik:', findError);
    process.exit(1);
  }

  if (existing) {
    logger.info(`Admin "${username}" allaqachon mavjud. Hech narsa qilinmadi.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { error: insertError } = await supabase
    .from('admins')
    .insert({ username, password_hash: passwordHash, role: 'SUPER_ADMIN' });

  if (insertError) {
    logger.error('Admin yaratishda xatolik:', insertError);
    process.exit(1);
  }

  logger.info(`✅ Admin "${username}" muvaffaqiyatli yaratildi (rol: SUPER_ADMIN).`);
  process.exit(0);
}

createAdmin();
