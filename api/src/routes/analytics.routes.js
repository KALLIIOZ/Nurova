const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/dashboard', authMiddleware, controller.getDashboardData);
router.get('/departments', authMiddleware, controller.getDepartmentData);

module.exports = router;
