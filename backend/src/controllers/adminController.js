const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');

// 1. Dashboard
const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

// 2. User Management
const getUsers = catchAsync(async (req, res) => {
    const result = await adminService.getUsers(req.query);
    res.status(200).json({ status: 'success', ...result });
});

const createUser = catchAsync(async (req, res) => {
    const result = await adminService.createUser(req.body);
    res.status(201).json({ status: 'success', message: 'User created successfully', data: result });
});

const updateUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await adminService.updateUser(userId, req.body);
    res.status(200).json({ status: 'success', message: 'User updated', data: result });
});

const toggleUserStatus = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await adminService.toggleUserStatus(userId);
    res.status(200).json({ status: 'success', message: `User status changed to ${result.statusText}`, data: result });
});

const resetPassword = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;
    const result = await adminService.resetUserPassword(userId, password);
    res.status(200).json({ status: 'success', message: 'Password reset successfully', data: result });
});

// 3. Centralized Patient Management
const getAllPatients = catchAsync(async (req, res) => {
    const patients = await adminService.getAllPatients(req.query);
    res.status(200).json({ status: 'success', data: patients });
});

// 4. Centralized Doctor Management
const getAllDoctors = catchAsync(async (req, res) => {
    const doctors = await adminService.getAllDoctors(req.query);
    res.status(200).json({ status: 'success', data: doctors });
});

const approveDoctor = catchAsync(async (req, res) => {
    const { doctorId } = req.params;
    const result = await adminService.approveDoctor(doctorId);
    res.status(200).json({ status: 'success', message: 'Doctor approved successfully', data: result });
});

// 5. Centralized Nurse Management
const getAllNurses = catchAsync(async (req, res) => {
    const nurses = await adminService.getAllNurses();
    res.status(200).json({ status: 'success', data: nurses });
});

// 6. Centralized Lab Management
const getAllLabOrders = catchAsync(async (req, res) => {
    const orders = await adminService.getAllLabOrders(req.query);
    res.status(200).json({ status: 'success', data: orders });
});

// 7. Centralized Pharmacy Management
const getPharmacyOverview = catchAsync(async (req, res) => {
    const overview = await adminService.getPharmacyOverview();
    res.status(200).json({ status: 'success', data: overview });
});

// 8. Centralized Accounts Management
const getAccountsOverview = catchAsync(async (req, res) => {
    const overview = await adminService.getAccountsOverview();
    res.status(200).json({ status: 'success', data: overview });
});

// 9. Centralized Appointment Management
const getAllAppointments = catchAsync(async (req, res) => {
    const appointments = await adminService.getAllAppointments(req.query);
    res.status(200).json({ status: 'success', data: appointments });
});

// 10. Centralized Reports
const getCentralizedReports = catchAsync(async (req, res) => {
    const { type = 'revenue' } = req.params;
    const report = await adminService.getCentralizedReports(type, req.query);
    res.status(200).json({ status: 'success', data: report });
});

// 11. Audit Logs
const getAuditLogs = catchAsync(async (req, res) => {
    const { limit } = req.query;
    const logs = await adminService.getAuditLogs(limit);
    res.status(200).json({ status: 'success', data: logs });
});

// 12. Departments
const getDepartments = catchAsync(async (req, res) => {
    const departments = await adminService.getDepartments();
    res.status(200).json({ status: 'success', data: departments });
});

const createDepartment = catchAsync(async (req, res) => {
    const department = await adminService.createDepartment(req.body);
    res.status(201).json({ status: 'success', message: 'Department created', data: department });
});

const deleteDepartment = catchAsync(async (req, res) => {
    const { id } = req.params;
    await adminService.deleteDepartment(id);
    res.status(200).json({ status: 'success', message: 'Department deleted' });
});

// Aliases for backward compatibility
const createStaff = createUser;
const getPendingDoctors = async (req, res, next) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats.pendingDoctors });
};

module.exports = {
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
};