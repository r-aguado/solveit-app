const express = require('express');
const router = express.Router();
const { getAll, toggleActive, getTechnicians, createUser } = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, verifyRole('admin'), getAll);
router.post('/', verifyToken, verifyRole('admin'), createUser);
router.patch('/:id/active', verifyToken, verifyRole('admin'), toggleActive);
router.get('/technicians', verifyToken, getTechnicians);

module.exports = router;
