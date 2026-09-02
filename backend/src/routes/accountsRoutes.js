const express = require('express');
const {
    getDashboardStats,
    getInvoices,
    recordPayment,
    getPayments,
    getExpenses,
    createExpense,
    deleteExpense,
    getFinancialReports,
    searchPatientLedger
} = require('../controllers/accountsController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, authorizeRoles('ACCOUNTS', 'SUPER_ADMIN'));

// 1. Dashboard Stats
router.get('/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);

// 2. Billing & Invoices
router.get('/invoices', getInvoices);
router.post('/invoices/:invoiceId/pay', recordPayment);

// 3. Payment Ledger
router.get('/payments', getPayments);

// 4. Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', deleteExpense);

// 5. Reports
router.get('/reports/:type', getFinancialReports);

// 6. Patient Ledger Search
router.get('/patient-search', searchPatientLedger);

module.exports = router;
