const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/', verifyToken, tenantMiddleware, verifyRole('admin', 'technician'), getStats);

module.exports = router;
