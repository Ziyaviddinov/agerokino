# 🎬 KinoBot

O'zbekiston uchun zamonaviy kino/serial Telegram bot va admin panel.

## Features
- Kino va serial qidirish
- Janr bo'yicha ko'rish
- TOP va yangi qo'shilgan kinolar
- Sevimlilar ro'yxati
- Kino tavsiyasi
- Web-based admin panel

## Technologies
- Node.js + Telegraf.js (bot)
- Express.js (admin API)
- Supabase (PostgreSQL)
- HTML/CSS/JS (admin panel)

## Installation
```bash
npm install
```

## Environment Variables
`.env.example` faylni `.env` ga nusxalang va qiymatlarni to'ldiring:
```bash
cp .env.example .env
```

## Supabase Setup
1. [supabase.com](https://supabase.com) da yangi loyiha (project) yarating.
2. Project Settings → API bo'limidan `Project URL` va `service_role` (yoki `anon`) key'ni oling, `.env` faylga yozing:
   ```
   SUPABASE_URL=...
   SUPABASE_KEY=...
   ```
3. Supabase Dashboard → **SQL Editor** ga o'ting.
4. `database/schema.sql` faylining butun mazmunini nusxalab, SQL Editor'ga joylashtiring va **Run** bosing.
   - Bu 7 ta jadval yaratadi: `users`, `genres`, `movies`, `favorites`, `admins`, `searches`, `views`.
5. (Ixtiyoriy, test uchun) `database/seed.sql` faylini ham xuddi shunday ishga tushiring — bu janrlar va 3 ta namunaviy film qo'shadi.
6. Table Editor'ga o'tib, jadvallar va ma'lumotlar to'g'ri yaratilganini tekshiring.

## Telegram Bot Setup
1. Telegram'da [@BotFather](https://t.me/BotFather)ga o'ting, `/newbot` yuboring va nomini tanlang.
2. BotFather bergan tokenni `.env`dagi `BOT_TOKEN`ga yozing.
3. Botingiz bilan bog'lanadigan Telegram kanal yarating (yoki mavjudini ishlating).
4. Botni kanalga **admin** qilib qo'shing (obunani tekshirish uchun shart).
5. Kanal ID'sini olish uchun kanalga istalgan xabar yuborib, [@userinfobot](https://t.me/userinfobot) yoki shunga o'xshash botdan foydalaning — `CHANNEL_ID` (masalan `-100xxxxxxxxxx`) va `CHANNEL_USERNAME` (masalan `@mychannel`)ni `.env`ga yozing.
6. `npm run dev` bilan botni ishga tushiring va Telegram'da `/start` yuboring.

## Admin Setup
1. `.env`da `ADMIN_USERNAME`, `ADMIN_PASSWORD` va kuchli `JWT_SECRET`ni to'ldiring (generatsiya qilish: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
2. Birinchi admin foydalanuvchisini yarating:
   ```bash
   npm run create-admin
   ```
   Bu skript parolni bcrypt bilan hash qilib, `admins` jadvaliga `SUPER_ADMIN` roli bilan yozadi.
3. Serverni ishga tushiring: `npm run server:dev`
4. Brauzerda `http://localhost:3000/login.html` orqali kiring.

## Local Development
```bash
npm run dev
```

## Testing
```bash
npm test
```
Bu sof logikani (formatlash, input validatsiya) tekshiruvchi avtomatik testlarni ishga tushiradi.
Bot va admin panelning to'liq (Telegram/Supabase bilan bog'liq) qo'lda tekshirish ro'yxati uchun [`TESTING.md`](./TESTING.md) fayliga qarang.

## Security
- `.env` fayli hech qachon Git'ga qo'shilmaydi (`.gitignore`da bor).
- Admin parollari faqat bcrypt hash sifatida saqlanadi.
- Admin panel API'si JWT token + rolga asoslangan ruxsat (`SUPER_ADMIN` / `ADMIN` / `EDITOR`) bilan himoyalangan.
- Login endpointida va umumiy `/api` so'rovlarida rate limiting bor (brute-force'dan himoya).
- HTTP xavfsizlik header'lari `helmet` orqali o'rnatiladi.
- Barcha input server tomonda tekshiriladi (validatsiya), qidiruv so'rovlaridagi maxsus belgilar ekranlanadi.
- Admin panel foydalanuvchi ma'lumotlarini `textContent` orqali chiqaradi (XSS'dan himoya).
- **Muhim:** Agar `.env` faylingiz birov bilan bo'lishilgan bo'lsa (masalan chatda, skrinshotda), `BOT_TOKEN`, `SUPABASE_KEY`, `JWT_SECRET` va admin parolni albatta almashtiring.

## Deployment
*(STEP 16 da to'ldiriladi)*

## Project Structure
```
kinobot/
├── bot/            # Telegram bot logikasi
├── server/         # Admin panel uchun REST API
├── database/       # SQL schema va seed fayllar
├── admin/          # Admin panel frontend
├── services/       # Biznes logika (DB + API abstraction)
├── config/         # Konfiguratsiya (Supabase client va h.k.)
├── scripts/        # Bir martalik skriptlar (masalan createAdmin.js)
├── tests/          # Avtomatik testlar (npm test)
├── utils/          # Yordamchi funksiyalar
└── TESTING.md      # Qo'lda tekshirish (manual QA) ro'yxati
```
