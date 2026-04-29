const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiAssistantController');
const { verifyToken } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.post('/ask', verifyToken, tenantMiddleware, askAI);

module.exports = router;
