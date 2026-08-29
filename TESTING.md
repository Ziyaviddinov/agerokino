# 🧪 KinoBot — Testing Checklist

Bu fayl loyihani deploy qilishdan oldin qo'lda (manual) tekshirish uchun ro'yxat.
Avtomatik testlar (`npm test`) faqat sof logikani (formatlash, validatsiya)
tekshiradi — Telegram/Supabase bilan bog'liq narsalarni qo'lda sinash kerak.

## 0. Avtomatik testlar
```bash
npm test
```
Barcha testlar ✅ (yashil) bo'lishi kerak.

## 1. Bot — asosiy oqim
- [ ] `/start` — kanalga obuna bo'lmagan holatda "obuna bo'ling" xabari chiqadi
- [ ] "✅ Obunani tekshirish" bosilganda (obuna bo'lgandan keyin) asosiy menyu chiqadi
- [ ] `users` jadvalida yangi qator paydo bo'ladi (Supabase Table Editor'da tekshiring)
- [ ] `/start`ni qayta yuborsangiz, yangi qator qo'shilmaydi, faqat `last_active` yangilanadi

## 2. Qidiruv
- [ ] "🔎 Kino qidirish" → nom yozganda mos natijalar chiqadi (qisman mos kelish, katta-kichik harf farqi yo'q)
- [ ] Mavjud bo'lmagan nom uchun "topilmadi" xabari chiqadi
- [ ] `searches` jadvaliga yozuv qo'shiladi

## 3. Film sahifasi
- [ ] Natijadan film tanlanganda to'liq ma'lumot (yil, reyting, janr, tavsif) chiqadi
- [ ] Poster bor bo'lsa rasm bilan, bo'lmasa matn bilan chiqadi
- [ ] "🎞 Treyler" va "🔗 Tomosha qilish" tugmalari to'g'ri URL'ga olib boradi
- [ ] `views` jadvaliga yozuv qo'shiladi

## 4. Janrlar
- [ ] "🎭 Janrlar" — barcha janrlar tugma shaklida chiqadi
- [ ] Janr tanlanganda shu janrdagi filmlar chiqadi
- [ ] Pagination (⬅️/➡️) sahifalar orasida to'g'ri o'tadi
- [ ] "Janrlarga qaytish" ishlaydi

## 5. Sevimlilar
- [ ] Film sahifasida "❤️ qo'shish" bosilganda `favorites`ga yoziladi, tugma "💔 olib tashlash"ga aylanadi
- [ ] "❤️ Sevimlilar" menyusida qo'shilgan filmlar ko'rinadi
- [ ] "💔 olib tashlash" bosilganda `favorites`dan o'chadi

## 6. TOP / Yangi qo'shilganlar
- [ ] "🔥 TOP kinolar" — reyting bo'yicha kamayish tartibida, raqamlangan
- [ ] "🆕 Yangi qo'shilganlar" — eng so'nggi qo'shilganlar birinchi

## 7. Xatolarni boshqarish
- [ ] Internetni vaqtincha uzib, botga xabar yuboring — bot "😕 xatolik yuz berdi" deydi, qulamaydi (texnik xato chiqmasligi kerak)
- [ ] Bir necha xabarni juda tez ketma-ket yuboring — flood-protection ishlashi kerak (ba'zilariga javob bermaydi, lekin bot qulamaydi)

## 8. Admin panel — kirish
- [ ] `npm run create-admin` — birinchi admin yaratiladi
- [ ] Noto'g'ri parol bilan kirish — "Username yoki parol noto'g'ri" xabari
- [ ] 10 marta ketma-ket noto'g'ri parol kiriting — rate limit ishga tushishi kerak
- [ ] To'g'ri login/parol bilan kirish — Dashboard'ga o'tadi
- [ ] Token'siz `index.html`, `movies.html`, `stats.html`ga to'g'ridan-to'g'ri kirishga urinib ko'ring — `login.html`ga qaytarishi kerak
- [ ] "Chiqish" tugmasi token'ni o'chirib, login sahifasiga qaytaradi

## 9. Admin panel — Dashboard
- [ ] 6 ta statistik karta to'g'ri raqamlar bilan chiqadi
- [ ] Raqamlar Supabase'dagi haqiqiy ma'lumotlarga mos keladi

## 10. Admin panel — Filmlar (CRUD)
- [ ] Yangi film qo'shish — jadvalda darhol ko'rinadi
- [ ] Bo'sh nom bilan saqlashga urinish — xato xabari chiqadi (validatsiya)
- [ ] Filmni tahrirlash — o'zgarishlar saqlanadi
- [ ] 👁/🙈 — holat o'zgaradi, yashirilgan film botda ko'rinmay qoladi (2-bo'limdagi qidiruvni qayta tekshiring)
- [ ] 🗑 — tasdiqlash oynasi chiqadi, "HA" bosilgandagina o'chadi
- [ ] Qidiruv va turi bo'yicha filtr to'g'ri ishlaydi
- [ ] Sahifalash (agar 10 tadan ko'p film bo'lsa) ishlaydi

## 11. Admin panel — Statistika
- [ ] Foydalanuvchilar o'sish grafigi chiqadi
- [ ] Eng ko'p ko'rilgan filmlar grafigi chiqadi (yoki filmlar hali ko'rilmagan bo'lsa — bo'sh holat xabari)

## 12. Xavfsizlik
- [ ] `.env` fayli `git status`da ko'rinmasligi kerak (`.gitignore` ishlayapti)
- [ ] Admin API'ga token'siz murojaat qilinganda 401 qaytadi (`curl` bilan tekshiring)
- [ ] EDITOR rolidagi admin bilan filmni o'chirishga urinib ko'ring — 403 qaytishi kerak

## 13. Turli qurilmalarda
- [ ] Admin panel mobil brauzerda (yoki brauzer devtools "mobile" rejimida) to'g'ri ko'rinadi (sidebar tepaga tushadi)
- [ ] Bot Telegram mobil ilovasida ham, desktop versiyasida ham to'g'ri ishlaydi
