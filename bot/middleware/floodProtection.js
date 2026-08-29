// Oddiy flood-protection: bir foydalanuvchi juda tez-tez xabar yuborsa,
// so'rovlar database'ga ortiqcha yuk bermasligi uchun bloklanadi.
// Murakkab kutubxona (masalan Redis) shart emas — kichik/o'rta bot uchun
// xotiradagi oddiy Map yetarli.

const lastMessageAt = new Map();
const MIN_INTERVAL_MS = 700; // bir foydalanuvchi uchun eng kamida shuncha vaqt oralig'i

function floodProtection() {
  return async (ctx, next) => {
    const userId = ctx.from && ctx.from.id;
    if (!userId) return next();

    const now = Date.now();
    const last = lastMessageAt.get(userId) || 0;

    if (now - last < MIN_INTERVAL_MS) {
      // Javob bermay, jimgina o'tkazib yuboramiz — foydalanuvchini ortiqcha xabar bilan bezovta qilmaymiz.
      return;
    }

    lastMessageAt.set(userId, now);
    return next();
  };
}

module.exports = floodProtection;
