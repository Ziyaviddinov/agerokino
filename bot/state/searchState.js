// Oddiy "foydalanuvchi qidiruv natijasini kutyapti" holatini saqlaydi.
// Session kutubxonasi ishlatilmadi, chunki bizga faqat bitta oddiy
// bayroq (flag) kerak — ortiqcha murakkablik shart emas.
// DIQQAT: bu xotirada saqlanadi, bot qayta ishga tushsa tozalanadi — bu normal.

const awaitingSearch = new Set();

function setAwaitingSearch(userId) {
  awaitingSearch.add(userId);
}

function isAwaitingSearch(userId) {
  return awaitingSearch.has(userId);
}

function clearAwaitingSearch(userId) {
  awaitingSearch.delete(userId);
}

module.exports = { setAwaitingSearch, isAwaitingSearch, clearAwaitingSearch };
