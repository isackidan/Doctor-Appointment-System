const medicineService = require('../services/medicineService');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');

// Use memory storage for CSV upload (no disk writes needed)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are supported for bulk import'), false);
        }
    }
});

const getCategories = catchAsync(async (req, res) => {
    const cats = medicineService.getCategories();
    res.status(200).json({ status: 'success', data: cats });
});

const getMedicines = catchAsync(async (req, res) => {
    const { search, category, page, limit } = req.query;
    const result = await medicineService.getMedicines({ search, category, page, limit });
    res.status(200).json({ status: 'success', ...result });
});

const addMedicine = catchAsync(async (req, res) => {
    const medicine = await medicineService.addMedicine(req.body);
    res.status(201).json({ status: 'success', message: 'Medicine added to catalog', data: medicine });
});

const updateMedicine = catchAsync(async (req, res) => {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);
    res.status(200).json({ status: 'success', message: 'Medicine updated', data: medicine });
});

const deleteMedicine = catchAsync(async (req, res) => {
    const result = await medicineService.deleteMedicine(req.params.id);
    res.status(200).json({ status: 'success', ...result });
});

const bulkImportCSV = [
    upload.single('file'),
    catchAsync(async (req, res) => {
        if (!req.file) throw new Error('No CSV file uploaded');
        const results = await medicineService.bulkImportFromCSV(req.file.buffer, req.file.mimetype);
        res.status(201).json({
            status: 'success',
            message: `Import complete: ${results.added} added, ${results.skipped} skipped`,
            data: results
        });
    })
];

module.exports = {
    getCategories,
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    bulkImportCSV
};
