const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/knowledgeController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);
router.post('/', verifyToken, verifyRole('admin', 'technician'), create);
router.put('/:id', verifyToken, verifyRole('admin', 'technician'), update);
router.delete('/:id', verifyToken, verifyRole('admin'), remove);

module.exports = router;
