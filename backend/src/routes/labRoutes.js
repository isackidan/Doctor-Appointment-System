const express = require('express');
const { 
    getDashboardStats, 
    getLabOrders, 
    collectSample, 
    processTest, 
    submitResult, 
    searchPatients 
} = require('../controllers/labController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('LAB_TECHNICIAN', 'SUPER_ADMIN'));

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Search Patients
router.get('/patients/search', searchPatients);

// Get Lab Orders (supports ?status=PENDING)
router.get('/orders', getLabOrders);

// Actions on Lab Request
router.put('/orders/:id/collect', collectSample);
router.put('/orders/:id/process', processTest);
router.post('/orders/:id/result', submitResult);

// Maintain old route for compatibility if used anywhere else
router.get('/requests', getLabOrders);

module.exports = router;
