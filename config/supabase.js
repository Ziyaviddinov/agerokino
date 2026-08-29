// Bu fayl Supabase'ga ulanishni bir marta yaratadi
// va boshqa fayllar shu clientdan foydalanadi.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Agar .env to'ldirilmagan bo'lsa, dastur ishga tushishi bilanoq xato beradi.
  // Bu keyinchalik "nima uchun ishlamayapti" degan chalkashlikning oldini oladi.
  throw new Error(
    '❌ SUPABASE_URL yoki SUPABASE_KEY topilmadi. .env faylni tekshiring.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
