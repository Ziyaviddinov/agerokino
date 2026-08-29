// Rolga asoslangan ruxsat middleware'i (STEP 25 talabiga ko'ra tayyorlangan).
// authMiddleware'dan KEYIN ishlatiladi, chunki req.admin kerak.

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Bu amal uchun ruxsatingiz yo\'q.' });
    }
    next();
  };
}

module.exports = requireRole;
