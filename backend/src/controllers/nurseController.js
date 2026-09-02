const nurseService = require('../services/nurseService');
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await nurseService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

const getNurseQueue = catchAsync(async (req, res) => {
    const queue = await nurseService.getNurseQueue();
    res.status(200).json({ status: 'success', data: queue });
});

const searchAssignedPatients = catchAsync(async (req, res) => {
    const { q } = req.query;
    const patients = await nurseService.searchAssignedPatients(q);
    res.status(200).json({ status: 'success', data: patients });
});

const recordVitals = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const vital = await nurseService.recordVitals(req.user.id, appointmentId, req.body);
    res.status(201).json({ status: 'success', message: '🩺 Vitals recorded & BMI calculated!', data: vital });
});

const getDoctorInstructions = catchAsync(async (req, res) => {
    const { patientId } = req.query;
    const instructions = await nurseService.getDoctorInstructions(patientId);
    res.status(200).json({ status: 'success', data: instructions });
});

const getPrescriptionsForNurse = catchAsync(async (req, res) => {
    const { patientId } = req.query;
    const prescriptions = await nurseService.getPrescriptionsForNurse(patientId);
    res.status(200).json({ status: 'success', data: prescriptions });
});

const logMedication = catchAsync(async (req, res) => {
    const { prescriptionItemId } = req.params;
    const { status, remarks } = req.body;
    const log = await nurseService.logMedication(req.user.id, prescriptionItemId, status, remarks);
    res.status(201).json({ status: 'success', message: `💊 Medication marked as ${status}!`, data: log });
});

const saveNursingNote = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const note = await nurseService.saveNursingNote(req.user.id, appointmentId, req.body);
    res.status(201).json({ status: 'success', message: '📝 Nursing Observation Note saved!', data: note });
});

const getWardBeds = catchAsync(async (req, res) => {
    const beds = await nurseService.getWardBeds();
    res.status(200).json({ status: 'success', data: beds });
});

const assignBed = catchAsync(async (req, res) => {
    const { patientId, wardCategory, bedNumber, reason } = req.body;
    const bed = await nurseService.assignBed(patientId, wardCategory, bedNumber, reason);
    res.status(201).json({ status: 'success', message: '🛏️ Bed Assigned!', data: bed });
});

module.exports = {
    getDashboardStats,
    getNurseQueue,
    searchAssignedPatients,
    recordVitals,
    getDoctorInstructions,
    getPrescriptionsForNurse,
    logMedication,
    saveNursingNote,
    getWardBeds,
    assignBed
};
