const express = require('express');
const router = express.Router();
const { getAll, toggleActive, getTechnicians, createUser } = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/', verifyToken, tenantMiddleware, verifyRole('admin'), getAll);
router.post('/', verifyToken, tenantMiddleware, verifyRole('admin'), createUser);
router.patch('/:id/active', verifyToken, tenantMiddleware, verifyRole('admin'), toggleActive);
router.get('/technicians', verifyToken, tenantMiddleware, getTechnicians);

module.exports = router;
