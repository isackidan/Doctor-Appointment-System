const express = require('express');
const {
    getDashboardStats,
    getUsers,
    createUser,
    createStaff,
    updateUser,
    toggleUserStatus,
    resetPassword,
    getAllPatients,
    getAllDoctors,
    approveDoctor,
    getPendingDoctors,
    getAllNurses,
    getAllLabOrders,
    getPharmacyOverview,
    getAccountsOverview,
    getAllAppointments,
    getCentralizedReports,
    getAuditLogs,
    getDepartments,
    createDepartment,
    deleteDepartment
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('SUPER_ADMIN'));

// 1. Dashboard
router.get('/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);

// 2. User Management
router.get('/users', getUsers);
router.post('/users', logActivity('CREATE_USER', 'SUPER_ADMIN'), createUser);
router.post('/create-staff', logActivity('CREATE_STAFF', 'SUPER_ADMIN'), createStaff);
router.put('/users/:userId', logActivity('UPDATE_USER', 'SUPER_ADMIN'), updateUser);
router.put('/users/:userId/toggle-status', logActivity('TOGGLE_USER_STATUS', 'SUPER_ADMIN'), toggleUserStatus);
router.put('/users/:userId/reset-password', logActivity('RESET_USER_PASSWORD', 'SUPER_ADMIN'), resetPassword);

// 3. Centralized Patient Management
router.get('/patients', getAllPatients);

// 4. Centralized Doctor Management
router.get('/doctors', getAllDoctors);
router.get('/all-doctors', getAllDoctors);
router.get('/pending-doctors', getPendingDoctors);
router.put('/approve-doctor/:doctorId', logActivity('APPROVE_DOCTOR', 'SUPER_ADMIN'), approveDoctor);

// 5. Centralized Nurse Management
router.get('/nurses', getAllNurses);

// 6. Centralized Lab Management
router.get('/lab-orders', getAllLabOrders);

// 7. Centralized Pharmacy Management
router.get('/pharmacy', getPharmacyOverview);

// 8. Centralized Accounts Management
router.get('/accounts', getAccountsOverview);

// 9. Centralized Appointments Management
router.get('/appointments', getAllAppointments);

// 10. Centralized Reports
router.get('/reports/:type', getCentralizedReports);

// 11. System Audit Logs
router.get('/audit-logs', getAuditLogs);

// 12. Departments
router.get('/departments', getDepartments);
router.post('/departments', logActivity('CREATE_DEPARTMENT', 'SUPER_ADMIN'), createDepartment);
router.delete('/departments/:id', logActivity('DELETE_DEPARTMENT', 'SUPER_ADMIN'), deleteDepartment);

module.exports = router;