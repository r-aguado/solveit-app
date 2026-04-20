const express = require('express');
const router = express.Router();
const { getAll, getOne, create, updateStatus, addComment, getCategories, assignTechnician } = require('../controllers/incidentController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/categories', verifyToken, getCategories);
router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);
router.post('/', verifyToken, create);
router.patch('/:id/status', verifyToken, verifyRole('admin', 'technician'), updateStatus);
router.patch('/:id/assign', verifyToken, verifyRole('admin'), assignTechnician);
router.post('/:id/comments', verifyToken, addComment);

module.exports = router;
