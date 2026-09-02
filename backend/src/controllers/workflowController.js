const workflowService = require('../services/workflowService');
const catchAsync = require('../utils/catchAsync');

const checkInPatient = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const result = await workflowService.checkInPatient(appointmentId);
    res.status(200).json({ status: 'success', message: 'Patient checked in successfully', data: result });
});

const recordVitals = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const result = await workflowService.recordVitals(appointmentId, req.user.id, req.body);
    res.status(200).json({ status: 'success', message: 'Vitals recorded successfully', data: result });
});

const startConsultation = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const result = await workflowService.startConsultation(appointmentId);
    res.status(200).json({ status: 'success', message: 'Consultation started', data: result });
});

const createLabRequest = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const { testName, category, notes } = req.body;
    const result = await workflowService.createLabRequest(appointmentId, req.user.id, testName, category, notes);
    res.status(201).json({ status: 'success', message: 'Lab test requested', data: result });
});

const uploadLabReport = catchAsync(async (req, res) => {
    const { labRequestId } = req.params;
    const { resultData, reportUrl, remarks } = req.body;
    const result = await workflowService.uploadLabReport(labRequestId, req.user.id, resultData, reportUrl, remarks);
    res.status(200).json({ status: 'success', message: 'Lab report uploaded successfully', data: result });
});

const createPrescription = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const { notes, items } = req.body;
    const result = await workflowService.createPrescription(appointmentId, req.user.id, notes, items);
    res.status(201).json({ status: 'success', message: 'Prescription generated', data: result });
});

const dispenseMedicine = catchAsync(async (req, res) => {
    const { prescriptionId } = req.params;
    const result = await workflowService.dispenseMedicine(prescriptionId);
    res.status(200).json({ status: 'success', message: result.message });
});

const processPayment = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const { amount, paymentMethod, referenceNo } = req.body;
    const result = await workflowService.processPayment(appointmentId, amount, paymentMethod, referenceNo);
    res.status(200).json({ status: 'success', message: 'Payment processed and treatment completed!', data: result });
});

module.exports = {
    checkInPatient,
    recordVitals,
    startConsultation,
    createLabRequest,
    uploadLabReport,
    createPrescription,
    dispenseMedicine,
    processPayment
};
