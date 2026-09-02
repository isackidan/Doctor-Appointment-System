const pharmacyService = require('../services/pharmacyService');
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await pharmacyService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

const getPrescriptionQueue = catchAsync(async (req, res) => {
    const queue = await pharmacyService.getPrescriptionQueue();
    res.status(200).json({ status: 'success', count: queue.length, data: queue });
});

const dispensePrescription = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const receipt = await pharmacyService.dispensePrescription(id, paymentMethod);
    res.status(200).json({ status: 'success', message: 'Prescription dispensed & inventory stock auto-deducted!', data: receipt });
});

const getInventory = catchAsync(async (req, res) => {
    const inventory = await pharmacyService.getInventory();
    res.status(200).json({ status: 'success', count: inventory.length, data: inventory });
});

const addMedicine = catchAsync(async (req, res) => {
    const medicine = await pharmacyService.addMedicine(req.body);
    res.status(201).json({ status: 'success', message: 'Medicine added to catalog', data: medicine });
});

const addStockBatch = catchAsync(async (req, res) => {
    const { medicineId } = req.params;
    const stock = await pharmacyService.addStockBatch(medicineId, req.body);
    res.status(201).json({ status: 'success', message: 'Stock batch added successfully', data: stock });
});

const getPendingPrescriptions = catchAsync(async (req, res) => {
    const queue = await pharmacyService.getPrescriptionQueue();
    res.status(200).json({ status: 'success', data: queue });
});

const addMedicineStock = catchAsync(async (req, res) => {
    const { name, category, unitPrice, batchNumber, quantity, expiryDate } = req.body;
    const medicine = await pharmacyService.addMedicine({ name, category, unitPrice, reorderLevel: 10 });
    const stock = await pharmacyService.addStockBatch(medicine.id, { batchNumber, quantity, expiryDate: expiryDate || '2028-12-31' });
    res.status(201).json({ status: 'success', message: 'Stock added successfully', data: { medicine, stock } });
});

const searchMedicines = catchAsync(async (req, res) => {
    const { q = '', limit = 20 } = req.query;
    const medicines = await pharmacyService.searchMedicines(q, limit);
    res.status(200).json({ status: 'success', count: medicines.length, data: medicines });
});

const createWalkInBill = catchAsync(async (req, res) => {
    const receipt = await pharmacyService.createWalkInBill(req.body);
    res.status(201).json({ status: 'success', message: 'Bill created successfully!', data: receipt });
});

module.exports = {
    getDashboardStats,
    getPrescriptionQueue,
    dispensePrescription,
    getInventory,
    addMedicine,
    addStockBatch,
    getPendingPrescriptions,
    addMedicineStock,
    searchMedicines,
    createWalkInBill
};
