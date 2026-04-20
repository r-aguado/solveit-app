const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, verifyRole('admin', 'technician'), getStats);

module.exports = router;
