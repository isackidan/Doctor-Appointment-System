const express = require('express');
const {
    getDashboardSummary,
    getProfile,
    updateProfile,
    getAppointments,
    getPrescriptions,
    getLabReports,
    getBills,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    changePassword
} = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Allow PATIENT or SUPER_ADMIN
router.use(verifyToken, authorizeRoles('PATIENT', 'SUPER_ADMIN'));

// 1. Dashboard
router.get('/dashboard', getDashboardSummary);

// 2. Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// 3. Appointments
router.get('/appointments', getAppointments);

// 4. Prescriptions
router.get('/prescriptions', getPrescriptions);

// 5. Lab Reports
router.get('/lab-reports', getLabReports);

// 6. Bills & Payments
router.get('/bills', getBills);

// 7. Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

// 8. Settings
router.put('/change-password', changePassword);

module.exports = router;
