const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parse } = require('csv-parse/sync');

const MEDICINE_CATEGORIES = [
    'Analgesic', 'Antibiotic', 'Cardiac', 'Diabetes', 'Gastro',
    'Respiratory', 'Vitamins', 'Neurology', 'Dermatology',
    'Ophthalmology', 'ENT', 'Gynaecology', 'Paediatric',
    'Oncology', 'Immunology', 'Surgical', 'Emergency', 'General'
];

class MedicineService {
    getCategories() {
        return MEDICINE_CATEGORIES;
    }

    async getMedicines({ search = '', category = '', page = 1, limit = 30 } = {}) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
            ...(category && category !== 'All' ? { category } : {})
        };

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                include: { stocks: true },
                orderBy: { name: 'asc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.medicine.count({ where })
        ]);

        return {
            medicines: medicines.map(m => ({
                ...m,
                totalStock: m.stocks.reduce((s, b) => s + b.quantity, 0),
                isLowStock: m.stocks.reduce((s, b) => s + b.quantity, 0) <= m.reorderLevel
            })),
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        };
    }

    async addMedicine({ name, category, unitPrice, reorderLevel }) {
        if (!name || !category || !unitPrice) {
            throw new AppError('Medicine Name, Category, and Unit Price are required', 400);
        }

        const existing = await prisma.medicine.findUnique({ where: { name: name.trim() } });
        if (existing) throw new AppError(`Medicine "${name}" already exists in catalog`, 409);

        return await prisma.medicine.create({
            data: {
                name: name.trim(),
                category,
                unitPrice: parseFloat(unitPrice),
                reorderLevel: reorderLevel ? parseInt(reorderLevel) : 10
            }
        });
    }

    async updateMedicine(id, { name, category, unitPrice, reorderLevel }) {
        const med = await prisma.medicine.findUnique({ where: { id } });
        if (!med) throw new AppError('Medicine not found', 404);

        return await prisma.medicine.update({
            where: { id },
            data: {
                ...(name ? { name: name.trim() } : {}),
                ...(category ? { category } : {}),
                ...(unitPrice ? { unitPrice: parseFloat(unitPrice) } : {}),
                ...(reorderLevel !== undefined ? { reorderLevel: parseInt(reorderLevel) } : {})
            }
        });
    }

    async deleteMedicine(id) {
        const med = await prisma.medicine.findUnique({ where: { id } });
        if (!med) throw new AppError('Medicine not found', 404);

        await prisma.medicine.delete({ where: { id } });
        return { message: `Medicine "${med.name}" deleted from catalog` };
    }

    // Bulk CSV / text import
    async bulkImportFromCSV(fileBuffer, mimeType) {
        let rows;

        // Parse CSV content
        const content = fileBuffer.toString('utf-8');

        try {
            rows = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (err) {
            throw new AppError('Invalid CSV format. Please use the correct template.', 400);
        }

        if (!rows || rows.length === 0) {
            throw new AppError('CSV file is empty or has no valid data rows', 400);
        }

        const results = { added: 0, skipped: 0, errors: [] };

        for (const row of rows) {
            const name = (row.name || row.Name || row.medicine_name || row['Medicine Name'] || '').trim();
            const category = (row.category || row.Category || row.type || 'General').trim();
            const unitPrice = parseFloat(row.unit_price || row.unitPrice || row.price || row.Price || row['Unit Price'] || 0);
            const reorderLevel = parseInt(row.reorder_level || row.reorderLevel || row['Reorder Level'] || 10);
            const initStock = parseInt(row.initial_stock || row.stock || row.quantity || row.Quantity || 100);

            if (!name || unitPrice <= 0) {
                results.errors.push(`Skipped invalid row: "${name || 'unnamed'}" — missing name or price`);
                continue;
            }

            try {
                const existing = await prisma.medicine.findUnique({ where: { name } });
                if (existing) {
                    results.skipped++;
                    continue;
                }

                const medicine = await prisma.medicine.create({
                    data: {
                        name,
                        category: MEDICINE_CATEGORIES.includes(category) ? category : 'General',
                        unitPrice,
                        reorderLevel
                    }
                });

                // Create initial stock batch
                if (initStock > 0) {
                    await prisma.medicineStock.create({
                        data: {
                            medicineId: medicine.id,
                            batchNumber: `CSV-${medicine.id.slice(0, 6).toUpperCase()}`,
                            quantity: initStock,
                            expiryDate: new Date('2028-12-31')
                        }
                    });
                }

                results.added++;
            } catch (err) {
                results.errors.push(`Failed to add "${name}": ${err.message}`);
            }
        }

        return results;
    }
}

module.exports = new MedicineService();
