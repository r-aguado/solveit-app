const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');
const { verifyToken } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');

router.get('/', verifyToken, tenantMiddleware, globalSearch);

module.exports = router;
