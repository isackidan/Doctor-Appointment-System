const express = require('express');
const {
    getDashboardStats,
    registerEmergencyIntake,
    searchPatients,
    registerPatient,
    bookAppointment,
    rescheduleAppointment,
    updateTokenStatus,
    updateStatus,
    collectFee,
    getDoctors,
    getPatient360History,
    requestIPDBedAllocation,
    uploadPatientDocument,
    getWhatsAppTicketPayload
} = require('../controllers/receptionistController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('RECEPTIONIST', 'SUPER_ADMIN'));

router.get('/stats', getDashboardStats);
router.post('/emergency-intake', logActivity('EMERGENCY_INTAKE', 'RECEPTION'), registerEmergencyIntake);
router.get('/patients/search', searchPatients);
router.get('/patients/:patientId/360-history', getPatient360History);
router.post('/patients', logActivity('REGISTER_PATIENT', 'RECEPTION'), registerPatient);
router.post('/patients/:patientId/documents', logActivity('UPLOAD_PATIENT_DOC', 'RECEPTION'), uploadPatientDocument);

router.post('/appointments', logActivity('BOOK_APPOINTMENT', 'RECEPTION'), bookAppointment);
router.put('/appointments/:id/reschedule', logActivity('RESCHEDULE_APPOINTMENT', 'RECEPTION'), rescheduleAppointment);
router.get('/appointments/:appointmentId/whatsapp-ticket', getWhatsAppTicketPayload);
router.put('/tokens/:tokenId/status', logActivity('UPDATE_TOKEN_STATUS', 'RECEPTION'), updateTokenStatus);
router.put('/appointments/:id/status', logActivity('UPDATE_PATIENT_STATUS', 'RECEPTION'), updateStatus);
router.post('/appointments/:id/collect-fee', logActivity('COLLECT_OPD_FEE', 'RECEPTION'), collectFee);

router.post('/ipd-bed-request', logActivity('IPD_BED_REQUEST', 'RECEPTION'), requestIPDBedAllocation);
router.get('/doctors', getDoctors);

module.exports = router;
