const patientService = require('../services/patientService');
const catchAsync = require('../utils/catchAsync');

// 1. Dashboard
const getDashboardSummary = catchAsync(async (req, res) => {
    const data = await patientService.getDashboardSummary(req.user.id);
    res.status(200).json({ status: 'success', data });
});

// 2. Profile
const getProfile = catchAsync(async (req, res) => {
    const data = await patientService.getProfile(req.user.id);
    res.status(200).json({ status: 'success', data });
});

const updateProfile = catchAsync(async (req, res) => {
    const data = await patientService.updateProfile(req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data
    });
});

// 3. Appointments
const getAppointments = catchAsync(async (req, res) => {
    const data = await patientService.getAppointments(req.user.id);
    res.status(200).json({ status: 'success', data });
});

// 4. Prescriptions
const getPrescriptions = catchAsync(async (req, res) => {
    const data = await patientService.getPrescriptions(req.user.id);
    res.status(200).json({ status: 'success', data });
});

// 5. Lab Reports
const getLabReports = catchAsync(async (req, res) => {
    const data = await patientService.getLabReports(req.user.id);
    res.status(200).json({ status: 'success', data });
});

// 6. Bills & Invoices
const getBills = catchAsync(async (req, res) => {
    const data = await patientService.getBills(req.user.id);
    res.status(200).json({ status: 'success', data });
});

// 7. Notifications
const getNotifications = catchAsync(async (req, res) => {
    const data = await patientService.getNotifications(req.user.id);
    res.status(200).json({ status: 'success', data });
});

const markNotificationRead = catchAsync(async (req, res) => {
    const { id } = req.params;
    await patientService.markNotificationRead(req.user.id, id);
    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
    await patientService.markAllNotificationsRead(req.user.id);
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
});

// 8. Settings & Change Password
const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await patientService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ status: 'success', message: result.message });
});

module.exports = {
    getDashboardSummary,
    getProfile,
    updateProfile,
    getAppointments,
    getPrescriptions,
    getLabReports,
    getBills,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    changePassword
};
