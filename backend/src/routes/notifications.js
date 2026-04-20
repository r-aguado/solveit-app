const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getAll, getUnreadCount, markRead, markAllRead } = require('../controllers/notificationController');

router.get('/', verifyToken, getAll);
router.get('/unread-count', verifyToken, getUnreadCount);
router.patch('/read-all', verifyToken, markAllRead);
router.patch('/:id/read', verifyToken, markRead);

module.exports = router;
