const doctorService = require('../services/doctorService');
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const stats = await doctorService.getDashboardStats(doctor.id);
    res.status(200).json({ status: 'success', data: stats });
});

const getAppointments = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { dateFilter, status } = req.query;
    const appointments = await doctorService.getAppointments(doctor.id, { dateFilter, status });
    res.status(200).json({ status: 'success', data: appointments });
});

const getDoctorQueue = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const queue = await doctorService.getDoctorQueue(doctor.id);
    res.status(200).json({ status: 'success', data: queue });
});

const getPatientHistory = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { patientId } = req.params;
    const history = await doctorService.getPatientHistory(doctor.id, patientId);
    res.status(200).json({ status: 'success', data: history });
});

const startConsultation = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const result = await doctorService.startConsultation(doctor.id, id);
    res.status(200).json({ status: 'success', message: 'Consultation started', data: result });
});

const saveConsultation = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const result = await doctorService.saveConsultation(doctor.id, id, req.body);
    res.status(200).json({ status: 'success', message: 'Consultation notes saved', data: result });
});

const savePrescription = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const { notes, items } = req.body;
    const rx = await doctorService.savePrescription(doctor.id, id, notes, items);
    res.status(200).json({ status: 'success', message: 'Prescription sent to Pharmacy!', data: rx });
});

const createLabRequest = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const { testName, category, priority, notes } = req.body;
    const labReq = await doctorService.createLabRequest(doctor.id, id, testName, category, priority, notes);
    res.status(201).json({ status: 'success', message: 'Lab test ordered!', data: labReq });
});

const acknowledgeLabResult = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { labRequestId } = req.params;
    const { remarks } = req.body;
    const result = await doctorService.acknowledgeLabResult(doctor.id, labRequestId, remarks);
    res.status(200).json({ status: 'success', message: 'Lab result acknowledged', data: result });
});

const generateMedicalDocument = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const { documentType } = req.query;
    const payload = await doctorService.generateMedicalDocument(doctor.id, id, documentType);
    res.status(200).json({ status: 'success', data: payload });
});

const completeConsultation = catchAsync(async (req, res) => {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const { id } = req.params;
    const result = await doctorService.completeConsultation(doctor.id, id);
    res.status(200).json({ status: 'success', message: 'Consultation completed', data: result });
});

const searchMedicines = catchAsync(async (req, res) => {
    const { q } = req.query;
    const medicines = await doctorService.searchMedicines(q);
    res.status(200).json({ status: 'success', data: medicines });
});

module.exports = {
    getDashboardStats,
    getAppointments,
    getDoctorQueue,
    getPatientHistory,
    startConsultation,
    saveConsultation,
    savePrescription,
    createLabRequest,
    acknowledgeLabResult,
    generateMedicalDocument,
    completeConsultation,
    searchMedicines
};