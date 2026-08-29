// Admin panel autentifikatsiya route'lari: /api/auth/login, /api/auth/me

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Brute-force hujumlardan himoya: 15 daqiqada 10 marta urinishga ruxsat.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Juda ko\'p urinish. Birozdan keyin qayta urinib ko\'ring.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username va parol talab qilinadi.' });
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    logger.error('Login xatosi (DB so\'rovi):', error);
    return res.status(500).json({ error: 'Ichki server xatosi yuz berdi.' });
  }

  // Xavfsizlik: username topilmasa ham parol solishtirilgandagi bilan bir xil xabar qaytariladi,
  // shunda tashqi odam "bu username mavjudmi" degan ma'lumotni bila olmaydi.
  if (!admin) {
    return res.status(401).json({ error: 'Username yoki parol noto\'g\'ri.' });
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Username yoki parol noto\'g\'ri.' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  logger.info(`Admin login: ${admin.username}`);

  res.json({
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role },
  });
});

// Token to'g'ri ishlayotganini tekshirish uchun himoyalangan endpoint.
router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
