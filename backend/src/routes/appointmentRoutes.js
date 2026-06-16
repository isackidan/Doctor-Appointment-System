const express = require('express');
const { bookAppointment, getUserAppointments, getPrescription, cancelAppointment } = require('../controllers/appointmentController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected Route: Need to be logged in to book
router.post('/book', verifyToken, bookAppointment);
router.get('/my-appointments', verifyToken, getUserAppointments);
router.get('/:appointmentId/prescription', verifyToken, getPrescription);
router.put('/:appointmentId/cancel', verifyToken, cancelAppointment)
module.exports = router;