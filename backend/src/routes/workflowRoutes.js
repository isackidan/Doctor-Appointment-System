const express = require('express');
const {
    checkInPatient,
    recordVitals,
    startConsultation,
    createLabRequest,
    uploadLabReport,
    createPrescription,
    dispenseMedicine,
    processPayment
} = require('../controllers/workflowController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// 1. Receptionist / Super Admin: Check in
router.put('/appointment/:appointmentId/check-in', authorizeRoles('RECEPTIONIST', 'SUPER_ADMIN'), logActivity('CHECK_IN', 'WORKFLOW'), checkInPatient);

// 2. Nurse / Super Admin: Record Vitals
router.post('/appointment/:appointmentId/vitals', authorizeRoles('NURSE', 'SUPER_ADMIN'), logActivity('RECORD_VITALS', 'WORKFLOW'), recordVitals);

// 3. Doctor / Super Admin: Start consultation
router.put('/appointment/:appointmentId/start-consultation', authorizeRoles('DOCTOR', 'SUPER_ADMIN'), logActivity('START_CONSULTATION', 'WORKFLOW'), startConsultation);

// 4. Doctor / Super Admin: Create Lab Request
router.post('/appointment/:appointmentId/lab-request', authorizeRoles('DOCTOR', 'SUPER_ADMIN'), logActivity('CREATE_LAB_REQUEST', 'WORKFLOW'), createLabRequest);

// 5. Lab Technician / Super Admin: Upload Lab Report
router.post('/lab-request/:labRequestId/report', authorizeRoles('LAB_TECHNICIAN', 'SUPER_ADMIN'), logActivity('UPLOAD_LAB_REPORT', 'WORKFLOW'), uploadLabReport);

// 6. Doctor / Super Admin: Create Prescription
router.post('/appointment/:appointmentId/prescription', authorizeRoles('DOCTOR', 'SUPER_ADMIN'), logActivity('CREATE_PRESCRIPTION', 'WORKFLOW'), createPrescription);

// 7. Pharmacy / Super Admin: Dispense Medicine
router.put('/prescription/:prescriptionId/dispense', authorizeRoles('PHARMACY', 'SUPER_ADMIN'), logActivity('DISPENSE_MEDICINE', 'WORKFLOW'), dispenseMedicine);

// 8. Accounts / Super Admin: Process Payment
router.post('/appointment/:appointmentId/payment', authorizeRoles('ACCOUNTS', 'SUPER_ADMIN'), logActivity('PROCESS_PAYMENT', 'WORKFLOW'), processPayment);

module.exports = router;
