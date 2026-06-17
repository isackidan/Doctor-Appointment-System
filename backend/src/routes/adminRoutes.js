const express = require('express');
const { approveDoctor, getPendingDoctors, getAllDoctors, getAllAppointments, getDashboardStats } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route declaration correct-a irukka?
router.put('/approve-doctor/:doctorId', verifyToken, isAdmin, approveDoctor);
router.get('/pending-doctors', verifyToken, isAdmin, getPendingDoctors);
router.get('/all-doctors', verifyToken, isAdmin, getAllDoctors);
router.get('/appointments', verifyToken, isAdmin, getAllAppointments);
router.get('/stats', verifyToken, isAdmin, getDashboardStats);
module.exports = router; // Kadasila idhu romba mukkiyam!