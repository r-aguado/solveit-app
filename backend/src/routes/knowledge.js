const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/knowledgeController');
const { getArticleRatings, createRating, deleteRating } = require('../controllers/knowledgeRatingsController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);
router.get('/:id/ratings', verifyToken, getArticleRatings);
router.post('/', verifyToken, verifyRole('admin', 'technician'), create);
router.post('/:id/ratings', verifyToken, createRating);
router.put('/:id', verifyToken, verifyRole('admin', 'technician'), update);
router.delete('/:id', verifyToken, verifyRole('admin'), remove);
router.delete('/:id/ratings/:ratingId', verifyToken, deleteRating);

module.exports = router;
