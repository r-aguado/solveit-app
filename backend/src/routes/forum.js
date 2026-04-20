const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, deletePost, addComment, deleteComment } = require('../controllers/forumController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getPosts);
router.post('/', verifyToken, createPost);
router.get('/:id', verifyToken, getPost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/comments', verifyToken, addComment);
router.delete('/:postId/comments/:commentId', verifyToken, deleteComment);

module.exports = router;
