const receptionistService = require('../services/receptionistService');
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await receptionistService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

const registerEmergencyIntake = catchAsync(async (req, res) => {
    const result = await receptionistService.registerEmergencyIntake(req.body);
    res.status(201).json({ status: 'success', message: '🚨 Emergency Fast-Track Patient Registered!', data: result });
});

const searchPatients = catchAsync(async (req, res) => {
    const { query: q } = req.query;
    const patients = await receptionistService.searchPatients(q);
    res.status(200).json({ status: 'success', count: patients.length, data: patients });
});

const registerPatient = catchAsync(async (req, res) => {
    const patient = await receptionistService.registerPatient(req.body);
    res.status(201).json({ status: 'success', message: 'Patient registered successfully', data: patient });
});

const bookAppointment = catchAsync(async (req, res) => {
    const result = await receptionistService.bookAppointment(req.body);
    res.status(201).json({ status: 'success', message: 'OPD Appointment & Token generated!', data: result });
});

const rescheduleAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;
    const updated = await receptionistService.rescheduleAppointment(id, date, startTime, endTime);
    res.status(200).json({ status: 'success', message: 'Appointment rescheduled successfully', data: updated });
});

const updateTokenStatus = catchAsync(async (req, res) => {
    const { tokenId } = req.params;
    const { status } = req.body;
    const updated = await receptionistService.updateTokenStatus(tokenId, status);
    res.status(200).json({ status: 'success', message: `Token status updated to ${status}`, data: updated });
});

const updateStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await receptionistService.updateStatus(id, status);
    res.status(200).json({ status: 'success', message: `Patient status updated to ${status}`, data: updated });
});

const collectFee = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { amount, paymentMethod } = req.body;
    const result = await receptionistService.collectFee(id, amount, paymentMethod);
    res.status(200).json({ status: 'success', message: 'OPD Fee collected & receipt generated!', data: result });
});

const getDoctors = catchAsync(async (req, res) => {
    const prisma = require('../config/prisma');
    const doctors = await prisma.doctor.findMany({
        where: { isApproved: true },
        include: { user: true, department: true }
    });
    res.status(200).json({ status: 'success', data: doctors });
});

const getPatient360History = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    const data = await receptionistService.getPatient360History(patientId);
    res.status(200).json({ status: 'success', data });
});

const requestIPDBedAllocation = catchAsync(async (req, res) => {
    const { patientId, wardCategory, bedNumber, reason } = req.body;
    const allocation = await receptionistService.requestIPDBedAllocation(patientId, wardCategory, bedNumber, reason);
    res.status(201).json({ status: 'success', message: '🛏️ IPD Bed Allocation Request Created!', data: allocation });
});

const uploadPatientDocument = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    const { name, fileUrl, type } = req.body;
    const doc = await receptionistService.uploadPatientDocument(patientId, name, fileUrl, type);
    res.status(201).json({ status: 'success', message: 'Patient document attached', data: doc });
});

const getWhatsAppTicketPayload = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const payload = await receptionistService.getWhatsAppTicketPayload(appointmentId);
    res.status(200).json({ status: 'success', data: payload });
});

module.exports = {
    getDashboardStats,
    registerEmergencyIntake,
    searchPatients,
    registerPatient,
    bookAppointment,
    rescheduleAppointment,
    updateTokenStatus,
    updateStatus,
    collectFee,
    getDoctors,
    getPatient360History,
    requestIPDBedAllocation,
    uploadPatientDocument,
    getWhatsAppTicketPayload
};
