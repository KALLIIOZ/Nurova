const express = require('express');
const router = express.Router();
const controller = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/profile', authMiddleware, controller.getProfile);

module.exports = router;
