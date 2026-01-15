const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointments.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/psychologist', authMiddleware, controller.getPsychologist);
router.get('/slots', authMiddleware, controller.getAvailableSlots);
router.post('/book', authMiddleware, controller.bookAppointment);

module.exports = router;
