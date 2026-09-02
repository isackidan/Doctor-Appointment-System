const labService = require('../services/labService');
const catchAsync = require('../utils/catchAsync');

// Dashboard Stats
const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await labService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

// Get Lab Orders
const getLabOrders = catchAsync(async (req, res) => {
    const statusFilter = req.query.status;
    const orders = await labService.getLabOrders(statusFilter);
    res.status(200).json({ status: 'success', data: orders });
});

// Record Sample Collection
const collectSample = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedRequest = await labService.collectSample(id, req.body);
    res.status(200).json({ status: 'success', data: updatedRequest });
});

// Process Test
const processTest = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedRequest = await labService.processTest(id);
    res.status(200).json({ status: 'success', data: updatedRequest });
});

// Submit Result
const submitResult = catchAsync(async (req, res) => {
    const { id } = req.params;
    const technicianId = req.user.id; // User ID from auth token
    const result = await labService.submitResult(id, req.body, technicianId);
    res.status(200).json({ status: 'success', data: result });
});

// Search Patients
const searchPatients = catchAsync(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ status: 'error', message: 'Search query is required' });
    }
    const patients = await labService.searchPatients(query);
    res.status(200).json({ status: 'success', data: patients });
});

module.exports = {
    getDashboardStats,
    getLabOrders,
    collectSample,
    processTest,
    submitResult,
    searchPatients
};
