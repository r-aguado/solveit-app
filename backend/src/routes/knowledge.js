const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/knowledgeController');
const { getArticleRatings, createRating, deleteRating } = require('../controllers/knowledgeRatingsController');
const { verifyToken, verifyRole } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/', verifyToken, tenantMiddleware, getAll);
router.get('/:id', verifyToken, tenantMiddleware, getOne);
router.get('/:id/ratings', verifyToken, tenantMiddleware, getArticleRatings);
router.post('/', verifyToken, tenantMiddleware, verifyRole('admin', 'technician'), create);
router.post('/:id/ratings', verifyToken, tenantMiddleware, createRating);
router.put('/:id', verifyToken, tenantMiddleware, verifyRole('admin', 'technician'), update);
router.delete('/:id', verifyToken, tenantMiddleware, verifyRole('admin'), remove);
router.delete('/:id/ratings/:ratingId', verifyToken, tenantMiddleware, deleteRating);

module.exports = router;
