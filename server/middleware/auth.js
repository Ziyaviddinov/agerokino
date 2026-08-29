// Admin API route'larini himoya qiluvchi middleware.
// Header'da "Authorization: Bearer <token>" bo'lishi shart.

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, username, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token yaroqsiz yoki muddati o\'tgan.' });
  }
}

module.exports = authMiddleware;
