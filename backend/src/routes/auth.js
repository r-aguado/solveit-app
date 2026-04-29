const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordResetController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);
router.patch('/profile', verifyToken, updateProfile);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Test endpoint
router.get('/test-email', (req, res) => {
  res.json({
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD_SET: !!process.env.GMAIL_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
  });
});

router.get('/test-password-resets', async (req, res) => {
  const pool = require('../db');
  try {
    const result = await pool.query('SELECT * FROM password_resets LIMIT 5');
    res.json({ table_exists: true, records: result.rows });
  } catch (err) {
    res.json({ table_exists: false, error: err.message });
  }
});

module.exports = router;
