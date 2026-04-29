const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { getAll, getUnreadCount, markRead, markAllRead } = require('../controllers/notificationController');

router.get('/', verifyToken, tenantMiddleware, getAll);
router.get('/unread-count', verifyToken, tenantMiddleware, getUnreadCount);
router.patch('/read-all', verifyToken, tenantMiddleware, markAllRead);
router.patch('/:id/read', verifyToken, tenantMiddleware, markRead);

module.exports = router;
