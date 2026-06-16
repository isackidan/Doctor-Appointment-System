const express = require('express');
const { addAvailabilitySlot, getApprovedDoctors, getDoctorSlots, getMyBookedAppointments, addPrescription } = require('../controllers/doctorController');
const { verifyToken, isDoctor } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected Route: Only logged-in DOCTOR can add slots
router.post('/slots', verifyToken, isDoctor, addAvailabilitySlot);
router.get('/list', verifyToken, getApprovedDoctors);
router.get('/:doctorProfileId/slots', verifyToken, getDoctorSlots);
router.get('/appointments', verifyToken, isDoctor, getMyBookedAppointments);
router.post('/appointment/:appointmentId/prescription', verifyToken, isDoctor, addPrescription);
module.exports = router;