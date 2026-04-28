const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, deletePost, addComment, deleteComment } = require('../controllers/forumController');
const { addReaction, removeReaction, getReactions } = require('../controllers/forumReactionsController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getPosts);
router.post('/', verifyToken, createPost);
router.get('/:id', verifyToken, getPost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/comments', verifyToken, addComment);
router.delete('/:postId/comments/:commentId', verifyToken, deleteComment);
router.get('/:postId/comments/:commentId/reactions', verifyToken, getReactions);
router.post('/:postId/comments/:commentId/reactions', verifyToken, addReaction);
router.delete('/:postId/comments/:commentId/reactions/:reactionId', verifyToken, removeReaction);

module.exports = router;
