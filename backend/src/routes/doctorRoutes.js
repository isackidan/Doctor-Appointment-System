const express = require('express');
const {
    getDashboardStats,
    getAppointments,
    getDoctorQueue,
    getPatientHistory,
    startConsultation,
    saveConsultation,
    savePrescription,
    createLabRequest,
    acknowledgeLabResult,
    generateMedicalDocument,
    completeConsultation,
    searchMedicines
} = require('../controllers/doctorController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('DOCTOR', 'SUPER_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/appointments', getAppointments);
router.get('/queue', getDoctorQueue);
router.get('/patient-history/:patientId', getPatientHistory);

router.post('/appointments/:id/start', logActivity('START_CONSULTATION', 'CLINICAL'), startConsultation);
router.put('/appointments/:id/consultation', logActivity('SAVE_CONSULTATION', 'CLINICAL'), saveConsultation);
router.post('/appointments/:id/prescription', logActivity('SAVE_PRESCRIPTION', 'CLINICAL'), savePrescription);
router.post('/appointments/:id/lab-request', logActivity('CREATE_LAB_REQUEST', 'CLINICAL'), createLabRequest);
router.put('/lab-requests/:labRequestId/acknowledge', logActivity('ACKNOWLEDGE_LAB_REPORT', 'CLINICAL'), acknowledgeLabResult);
router.get('/appointments/:id/document', generateMedicalDocument);
router.put('/appointments/:id/complete', logActivity('COMPLETE_CONSULTATION', 'CLINICAL'), completeConsultation);

router.get('/medicines/search', searchMedicines);

module.exports = router;