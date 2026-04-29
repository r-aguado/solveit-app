const express = require('express');
const router = express.Router();
const { getAll, getOne, create, updateStatus, addComment, getCategories, assignTechnician } = require('../controllers/incidentController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/categories', verifyToken, tenantMiddleware, getCategories);
router.get('/', verifyToken, tenantMiddleware, getAll);
router.get('/:id', verifyToken, tenantMiddleware, getOne);
router.post('/', verifyToken, tenantMiddleware, create);
router.patch('/:id/status', verifyToken, tenantMiddleware, verifyRole('admin', 'technician'), updateStatus);
router.patch('/:id/assign', verifyToken, tenantMiddleware, verifyRole('admin'), assignTechnician);
router.post('/:id/comments', verifyToken, tenantMiddleware, addComment);

module.exports = router;
