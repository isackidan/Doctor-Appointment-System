const accountsService = require('../services/accountsService');
const catchAsync = require('../utils/catchAsync');

// 1. Dashboard Stats
const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await accountsService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

// 2. Billing Invoices
const getInvoices = catchAsync(async (req, res) => {
    const invoices = await accountsService.getInvoices(req.query);
    res.status(200).json({ status: 'success', data: invoices });
});

// 3. Record Payment
const recordPayment = catchAsync(async (req, res) => {
    const { invoiceId } = req.params;
    const result = await accountsService.recordPayment(invoiceId, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Payment recorded successfully',
        data: result
    });
});

// 4. Payment Transactions Ledger
const getPayments = catchAsync(async (req, res) => {
    const payments = await accountsService.getPayments(req.query);
    res.status(200).json({ status: 'success', data: payments });
});

// 5. Expenses
const getExpenses = catchAsync(async (req, res) => {
    const data = await accountsService.getExpenses(req.query);
    res.status(200).json({ status: 'success', data });
});

const createExpense = catchAsync(async (req, res) => {
    const expense = await accountsService.createExpense(req.body, req.user);
    res.status(201).json({
        status: 'success',
        message: 'Expense added successfully',
        data: expense
    });
});

const deleteExpense = catchAsync(async (req, res) => {
    const { id } = req.params;
    await accountsService.deleteExpense(id);
    res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully'
    });
});

// 6. Reports
const getFinancialReports = catchAsync(async (req, res) => {
    const { type = 'daily_collection' } = req.params;
    const report = await accountsService.getFinancialReports(type, req.query);
    res.status(200).json({ status: 'success', data: report });
});

// 7. Patient Ledger Search
const searchPatientLedger = catchAsync(async (req, res) => {
    const { query } = req.query;
    const results = await accountsService.searchPatientLedger(query);
    res.status(200).json({ status: 'success', data: results });
});

// Maintain backward compatibility for stats
const getBillingStats = getDashboardStats;

module.exports = {
    getDashboardStats,
    getBillingStats,
    getInvoices,
    recordPayment,
    getPayments,
    getExpenses,
    createExpense,
    deleteExpense,
    getFinancialReports,
    searchPatientLedger
};
