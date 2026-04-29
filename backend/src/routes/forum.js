const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, deletePost, addComment, deleteComment } = require('../controllers/forumController');
const { addReaction, removeReaction, getReactions } = require('../controllers/forumReactionsController');
const { verifyToken } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/', verifyToken, tenantMiddleware, getPosts);
router.post('/', verifyToken, tenantMiddleware, createPost);
router.get('/:id', verifyToken, tenantMiddleware, getPost);
router.delete('/:id', verifyToken, tenantMiddleware, deletePost);
router.post('/:id/comments', verifyToken, tenantMiddleware, addComment);
router.delete('/:postId/comments/:commentId', verifyToken, tenantMiddleware, deleteComment);
router.get('/:postId/comments/:commentId/reactions', verifyToken, tenantMiddleware, getReactions);
router.post('/:postId/comments/:commentId/reactions', verifyToken, tenantMiddleware, addReaction);
router.delete('/:postId/comments/:commentId/reactions/:reactionId', verifyToken, tenantMiddleware, removeReaction);

module.exports = router;
