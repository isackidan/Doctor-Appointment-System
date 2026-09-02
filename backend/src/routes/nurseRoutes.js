const express = require('express');
const {
    getDashboardStats,
    getNurseQueue,
    searchAssignedPatients,
    recordVitals,
    getDoctorInstructions,
    getPrescriptionsForNurse,
    logMedication,
    saveNursingNote,
    getWardBeds,
    assignBed
} = require('../controllers/nurseController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('NURSE', 'SUPER_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/queue', getNurseQueue);
router.get('/patients', searchAssignedPatients);

router.post('/appointments/:appointmentId/vitals', logActivity('RECORD_VITALS', 'NURSE'), recordVitals);
router.get('/doctor-instructions', getDoctorInstructions);

router.get('/prescriptions', getPrescriptionsForNurse);
router.post('/medications/:prescriptionItemId/log', logActivity('LOG_MEDICATION', 'NURSE'), logMedication);

router.post('/appointments/:appointmentId/notes', logActivity('SAVE_NURSING_NOTE', 'NURSE'), saveNursingNote);

router.get('/wards', getWardBeds);
router.post('/wards/assign', logActivity('ASSIGN_BED', 'NURSE'), assignBed);

module.exports = router;
