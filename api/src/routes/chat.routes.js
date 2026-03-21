const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, controller.getMessages);
router.post('/', authMiddleware, controller.sendMessage);

module.exports = router;
