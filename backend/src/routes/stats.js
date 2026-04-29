const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');
const { verifyToken } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/user', verifyToken, tenantMiddleware, getUserStats);

module.exports = router;
