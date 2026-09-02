const express = require('express');
const {
    getDashboardStats,
    getPrescriptionQueue,
    dispensePrescription,
    getInventory,
    addMedicine,
    addStockBatch,
    searchMedicines,
    createWalkInBill,
    addMedicineStock
} = require('../controllers/pharmacyController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('PHARMACY', 'SUPER_ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/prescriptions', getPrescriptionQueue);
router.post('/dispense/:id', logActivity('DISPENSE_MEDICINE', 'PHARMACY'), dispensePrescription);

router.get('/inventory', getInventory);
router.post('/medicines', logActivity('ADD_MEDICINE', 'PHARMACY'), addMedicine);
router.post('/medicines/:medicineId/stocks', logActivity('ADD_STOCK_BATCH', 'PHARMACY'), addStockBatch);
router.post('/stock', logActivity('ADD_MEDICINE_STOCK', 'PHARMACY'), addMedicineStock);

// POS Billing Routes
router.get('/medicines/search', searchMedicines);
router.post('/billing/walk-in', logActivity('CREATE_WALKIN_BILL', 'PHARMACY'), createWalkInBill);

module.exports = router;
