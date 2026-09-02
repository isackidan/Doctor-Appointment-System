const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

class PharmacyService {
    // 1. Full Pharmacy Dashboard Statistics & Financial Aggregations
    async getDashboardStats() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            pendingPrescriptions,
            dispensedToday,
            totalMedicines,
            medicines,
            allSales,
            todaySales,
            allRxPayments,
            todayRxPayments
        ] = await Promise.all([
            prisma.prescription.count({ where: { dispensed: false } }),
            prisma.prescription.count({ where: { dispensed: true, updatedAt: { gte: startOfDay } } }),
            prisma.medicine.count(),
            prisma.medicine.findMany({ include: { stocks: true } }),
            prisma.pharmacySale.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.pharmacySale.findMany({ where: { createdAt: { gte: startOfDay } }, orderBy: { createdAt: 'desc' } }),
            prisma.payment.findMany({ where: { referenceNo: { startsWith: 'RX-BILL' } }, orderBy: { paidAt: 'desc' } }),
            prisma.payment.findMany({ where: { referenceNo: { startsWith: 'RX-BILL' }, paidAt: { gte: startOfDay } }, orderBy: { paidAt: 'desc' } })
        ]);

        // Low stock count calculation
        let lowStockCount = 0;
        let outOfStockCount = 0;
        medicines.forEach(m => {
            const totalStock = m.stocks.reduce((sum, s) => sum + s.quantity, 0);
            if (totalStock === 0) outOfStockCount++;
            else if (totalStock <= m.reorderLevel) lowStockCount++;
        });

        // Combined POS + Prescription Sales & Revenue
        const posTotalRevenue = allSales.reduce((acc, s) => acc + s.totalAmount, 0);
        const posTodayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
        const rxTotalRevenue = allRxPayments.reduce((acc, p) => acc + p.amount, 0);
        const rxTodayRevenue = todayRxPayments.reduce((acc, p) => acc + p.amount, 0);

        const totalSalesCount = allSales.length + allRxPayments.length;
        const todaySalesCount = todaySales.length + todayRxPayments.length;

        const totalRevenue = parseFloat((posTotalRevenue + rxTotalRevenue).toFixed(2));
        const todayRevenue = parseFloat((posTodayRevenue + rxTodayRevenue).toFixed(2));
        const avgBillValue = totalSalesCount > 0 ? parseFloat((totalRevenue / totalSalesCount).toFixed(2)) : 0;

        // Payment method breakdown (across all POS + Prescription transactions)
        const paymentBreakdown = {
            CASH: { count: 0, amount: 0 },
            CARD: { count: 0, amount: 0 },
            UPI: { count: 0, amount: 0 },
            ONLINE: { count: 0, amount: 0 }
        };

        allSales.forEach(s => {
            const method = (s.paymentMethod || 'CASH').toUpperCase();
            if (paymentBreakdown[method]) {
                paymentBreakdown[method].count += 1;
                paymentBreakdown[method].amount += s.totalAmount;
            }
        });

        allRxPayments.forEach(p => {
            const method = (p.paymentMethod || 'CASH').toUpperCase();
            if (paymentBreakdown[method]) {
                paymentBreakdown[method].count += 1;
                paymentBreakdown[method].amount += p.amount;
            }
        });

        // Parse items from sales for Top Selling Medicines
        const itemFreqMap = {};
        allSales.forEach(s => {
            try {
                const items = JSON.parse(s.itemsJson || '[]');
                items.forEach(it => {
                    const name = it.medicineName || 'Medicine';
                    const qty = parseInt(it.quantity) || 1;
                    if (!itemFreqMap[name]) itemFreqMap[name] = { name, quantitySold: 0, totalRevenue: 0 };
                    itemFreqMap[name].quantitySold += qty;
                    itemFreqMap[name].totalRevenue += (it.unitPrice * qty);
                });
            } catch (e) {}
        });

        const topSellingMedicines = Object.values(itemFreqMap)
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 5);

        // Recent sales list with parsed items
        const recentSales = allSales.slice(0, 10).map(s => {
            let parsedItems = [];
            try { parsedItems = JSON.parse(s.itemsJson); } catch (e) {}
            return {
                ...s,
                cartItems: parsedItems
            };
        });

        return {
            totalSalesCount,
            todaySalesCount,
            totalRevenue,
            todayRevenue,
            avgBillValue,
            pendingPrescriptions,
            dispensedToday,
            totalMedicines,
            lowStockCount,
            outOfStockCount,
            paymentBreakdown,
            topSellingMedicines,
            recentSales
        };
    }

    // 2. Doctor Prescription Queue (Awaiting Dispensing)
    async getPrescriptionQueue() {
        return await prisma.prescription.findMany({
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                appointment: true,
                items: { include: { medicine: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 3. Smart Dispense Engine & Inventory Stock Auto-Deduction
    async dispensePrescription(prescriptionId, paymentMethod = 'CASH') {
        const rx = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
                items: { include: { medicine: true } },
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                appointment: true
            }
        });

        if (!rx) throw new AppError('Prescription record not found', 404);
        if (rx.dispensed) throw new AppError('This prescription has already been dispensed', 400);

        return await prisma.$transaction(async (tx) => {
            let totalBillAmount = 0;
            const cartItems = [];

            // Auto-deduct stock for each medicine item
            for (const item of rx.items) {
                const qtyToDeduct = item.quantity || 1;
                const unitPrice = item.medicine?.unitPrice || 45.0;
                totalBillAmount += unitPrice * qtyToDeduct;

                cartItems.push({
                    medicineId: item.medicineId,
                    medicineName: item.medicineName || item.medicine?.name || 'Prescribed Medicine',
                    quantity: qtyToDeduct,
                    unitPrice
                });

                if (item.medicineId) {
                    const stocks = await tx.medicineStock.findMany({
                        where: { medicineId: item.medicineId, quantity: { gt: 0 } },
                        orderBy: { expiryDate: 'asc' }
                    });

                    let remaining = qtyToDeduct;
                    for (const s of stocks) {
                        if (remaining <= 0) break;
                        const deduct = Math.min(s.quantity, remaining);
                        await tx.medicineStock.update({
                            where: { id: s.id },
                            data: { quantity: s.quantity - deduct }
                        });
                        remaining -= deduct;
                    }
                }
            }

            // Mark prescription dispensed
            const updatedRx = await tx.prescription.update({
                where: { id: prescriptionId },
                data: { dispensed: true },
                include: { items: true, patient: { include: { user: true } }, doctor: { include: { user: true } } }
            });

            // Update appointment status to MEDICINE_DISPENSED
            if (rx.appointmentId) {
                await tx.appointment.update({
                    where: { id: rx.appointmentId },
                    data: { status: 'MEDICINE_DISPENSED' }
                });
            }

            const billRef = `RX-BILL-${Date.now().toString().slice(-6)}`;
            const finalAmount = totalBillAmount || 450.0;

            // Create Invoice & Payment (Accounts module sees this via Invoice+Payment models)
            const invoice = await tx.invoice.upsert({
                where: { appointmentId: rx.appointmentId },
                update: { paymentStatus: 'PAID' },
                create: {
                    appointmentId: rx.appointmentId,
                    patientId: rx.patientId,
                    subTotal: finalAmount,
                    totalAmount: finalAmount,
                    paymentStatus: 'PAID'
                }
            });

            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: finalAmount,
                    paymentMethod,
                    referenceNo: billRef,
                    paidAt: new Date()
                }
            });

            return {
                prescription: updatedRx,
                invoice,
                payment,
                billRef,
                totalBillAmount: finalAmount
            };
        });
    }

    // 4. Medicine Inventory & Stock Levels
    async getInventory() {
        const medicines = await prisma.medicine.findMany({
            include: { stocks: true },
            orderBy: { name: 'asc' }
        });

        return medicines.map(m => {
            const totalStock = m.stocks.reduce((sum, s) => sum + s.quantity, 0);
            return {
                ...m,
                totalStock,
                isLowStock: totalStock <= m.reorderLevel
            };
        });
    }

    // 5. Add Medicine to Catalog
    async addMedicine(data) {
        const { name, category, unitPrice, reorderLevel } = data;
        if (!name || !category || !unitPrice) {
            throw new AppError('Name, Category, and Unit Price are required', 400);
        }

        return await prisma.medicine.create({
            data: {
                name,
                category,
                unitPrice: parseFloat(unitPrice),
                reorderLevel: reorderLevel ? parseInt(reorderLevel) : 10
            }
        });
    }

    // 6. Add Stock Batch to Medicine
    async addStockBatch(medicineId, data) {
        const { batchNumber, quantity, expiryDate } = data;
        if (!batchNumber || !quantity || !expiryDate) {
            throw new AppError('Batch Number, Quantity, and Expiry Date are required', 400);
        }

        return await prisma.medicineStock.create({
            data: {
                medicineId,
                batchNumber,
                quantity: parseInt(quantity),
                expiryDate: new Date(expiryDate)
            }
        });
    }

    // 7. Search Medicines for Billing Autocomplete
    async searchMedicines(query = '', limit = 20) {
        return await prisma.medicine.findMany({
            where: query
                ? { name: { contains: query, mode: 'insensitive' } }
                : {},
            include: { stocks: true },
            take: parseInt(limit),
            orderBy: { name: 'asc' }
        });
    }

    // 8. Create Walk-In Customer Bill (POS Terminal) & Persist to PharmacySale
    async createWalkInBill({ customerName, customerPhone, cartItems, paymentMethod, amountPaid, discount = 0 }) {
        if (!customerName || !cartItems || cartItems.length === 0) {
            throw new AppError('Customer name and at least one medicine item are required', 400);
        }

        // Calculate bill totals
        let subTotal = 0;
        for (const item of cartItems) {
            subTotal += parseFloat(item.unitPrice) * parseInt(item.quantity);
        }

        const discountAmount = parseFloat((subTotal * (discount / 100)).toFixed(2));
        const totalAmount = parseFloat((subTotal - discountAmount).toFixed(2));
        const changeAmount = amountPaid ? parseFloat((parseFloat(amountPaid) - totalAmount).toFixed(2)) : 0;

        const billRef = `BILL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        return await prisma.$transaction(async (tx) => {
            // Deduct stock for each item
            for (const item of cartItems) {
                if (item.medicineId) {
                    const stocks = await tx.medicineStock.findMany({
                        where: { medicineId: item.medicineId, quantity: { gt: 0 } },
                        orderBy: { expiryDate: 'asc' }
                    });
                    let remaining = parseInt(item.quantity);
                    for (const s of stocks) {
                        if (remaining <= 0) break;
                        const deduct = Math.min(s.quantity, remaining);
                        await tx.medicineStock.update({
                            where: { id: s.id },
                            data: { quantity: s.quantity - deduct }
                        });
                        remaining -= deduct;
                    }
                }
            }

            // Save sale into PharmacySale table
            const saleRecord = await tx.pharmacySale.create({
                data: {
                    billRef,
                    customerName,
                    customerPhone: customerPhone || 'N/A',
                    subTotal,
                    discount: parseFloat(discount),
                    discountAmount,
                    totalAmount,
                    paymentMethod,
                    amountPaid: parseFloat(amountPaid) || totalAmount,
                    changeAmount: changeAmount > 0 ? changeAmount : 0,
                    itemsJson: JSON.stringify(cartItems)
                }
            });

            return {
                billRef,
                customerName,
                customerPhone: customerPhone || 'N/A',
                cartItems,
                subTotal,
                discount,
                discountAmount,
                totalAmount,
                paymentMethod,
                amountPaid: parseFloat(amountPaid) || totalAmount,
                changeAmount: changeAmount > 0 ? changeAmount : 0,
                createdAt: saleRecord.createdAt
            };
        });
    }
}

module.exports = new PharmacyService();
