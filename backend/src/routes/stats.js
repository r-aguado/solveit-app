const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');
const { verifyToken } = require('../middleware/auth');

router.get('/user', verifyToken, getUserStats);

module.exports = router;
