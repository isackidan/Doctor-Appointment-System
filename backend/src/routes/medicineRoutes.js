const express = require('express');
const {
    getCategories,
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    bulkImportCSV
} = require('../controllers/medicineController');
const { verifyToken, authorizeRoles, logActivity } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('PHARMACY', 'SUPER_ADMIN'));

router.get('/categories', getCategories);
router.get('/', getMedicines);
router.post('/', logActivity('ADD_MEDICINE', 'PHARMACY'), addMedicine);
router.put('/:id', logActivity('UPDATE_MEDICINE', 'PHARMACY'), updateMedicine);
router.delete('/:id', logActivity('DELETE_MEDICINE', 'PHARMACY'), deleteMedicine);
router.post('/bulk-import', logActivity('BULK_IMPORT_MEDICINES', 'PHARMACY'), bulkImportCSV);

module.exports = router;
