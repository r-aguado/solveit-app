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

module.exports = router;
