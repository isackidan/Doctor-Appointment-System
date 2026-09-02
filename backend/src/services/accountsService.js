const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

class AccountsService {
    // 1. Dashboard Stats
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            todayPaymentsAgg,
            todayPaymentsCount,
            totalRevenueAgg,
            totalPaymentsCount,
            pendingInvoices,
            todayExpensesAgg,
            totalExpensesAgg,
            recentPayments,
            recentInvoices,
            todayPosSalesAgg,
            totalPosSalesAgg
        ] = await Promise.all([
            // Today's revenue from payments
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { paidAt: { gte: today, lt: tomorrow } }
            }),
            // Today's payments count
            prisma.payment.count({
                where: { paidAt: { gte: today, lt: tomorrow } }
            }),
            // Total overall revenue from payments
            prisma.payment.aggregate({
                _sum: { amount: true }
            }),
            // Total payments count
            prisma.payment.count(),
            // Pending/Partial invoices
            prisma.invoice.findMany({
                where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
                include: { payments: true }
            }),
            // Today expenses
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { date: { gte: today, lt: tomorrow } }
            }),
            // Total expenses
            prisma.expense.aggregate({
                _sum: { amount: true }
            }),
            // Recent 5 payments
            prisma.payment.findMany({
                take: 5,
                orderBy: { paidAt: 'desc' },
                include: {
                    invoice: {
                        include: {
                            patient: { include: { user: true } }
                        }
                    }
                }
            }),
            // Recent 5 invoices
            prisma.invoice.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: { include: { user: true } },
                    payments: true
                }
            }),
            // POS Walk-in pharmacy sales today
            prisma.pharmacySale.aggregate({
                _sum: { totalAmount: true },
                where: { createdAt: { gte: today, lt: tomorrow } }
            }),
            // Total POS Walk-in pharmacy sales
            prisma.pharmacySale.aggregate({
                _sum: { totalAmount: true }
            })
        ]);

        // Calculate pending amounts
        let totalPendingAmount = 0;
        pendingInvoices.forEach(inv => {
            const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
            const pending = Math.max(0, inv.totalAmount - paid);
            totalPendingAmount += pending;
        });

        const todayPaymentRevenue = todayPaymentsAgg._sum.amount || 0;
        const todayPosRevenue = todayPosSalesAgg._sum.totalAmount || 0;
        const totalPaymentRevenue = totalRevenueAgg._sum.amount || 0;
        const totalPosRevenue = totalPosSalesAgg._sum.totalAmount || 0;

        return {
            todayRevenue: parseFloat((todayPaymentRevenue + todayPosRevenue).toFixed(2)),
            todayPaymentsCount,
            totalRevenue: parseFloat((totalPaymentRevenue + totalPosRevenue).toFixed(2)),
            totalPaymentsCount,
            pendingInvoicesCount: pendingInvoices.length,
            totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
            todayExpenses: todayExpensesAgg._sum.amount || 0,
            totalExpenses: totalExpensesAgg._sum.amount || 0,
            recentPayments,
            recentInvoices
        };
    }

    // 2. Get Invoices with calculated dues and payment history
    async getInvoices(filters = {}) {
        const { status, search } = filters;

        const whereClause = {};

        if (status && status !== 'ALL') {
            whereClause.paymentStatus = status;
        }

        if (search) {
            whereClause.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { patient: { patientCode: { contains: search, mode: 'insensitive' } } },
                { patient: { user: { name: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
                patient: { include: { user: true } },
                appointment: {
                    include: {
                        doctor: { include: { user: true } },
                        department: true
                    }
                },
                payments: {
                    orderBy: { paidAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich with paid and pending calculations
        return invoices.map(inv => {
            const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
            const pendingAmount = Math.max(0, inv.totalAmount - paidAmount);
            return {
                ...inv,
                paidAmount,
                pendingAmount
            };
        });
    }

    // 3. Record Payment against an Invoice
    async recordPayment(invoiceId, paymentData) {
        const { amount, paymentMethod = 'CASH', referenceNo, notes } = paymentData;
        const payAmount = parseFloat(amount);

        if (isNaN(payAmount) || payAmount <= 0) {
            throw new AppError('Valid payment amount is required', 400);
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true, appointment: true }
        });

        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        const currentPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const currentPending = invoice.totalAmount - currentPaid;

        if (payAmount > currentPending + 0.01) {
            throw new AppError(`Payment amount (₹${payAmount}) exceeds outstanding balance (₹${currentPending.toFixed(2)})`, 400);
        }

        return await prisma.$transaction(async (tx) => {
            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: payAmount,
                    paymentMethod: paymentMethod.toUpperCase(),
                    referenceNo: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
                    paidAt: new Date()
                }
            });

            const newTotalPaid = currentPaid + payAmount;
            const newStatus = newTotalPaid >= invoice.totalAmount - 0.01 ? 'PAID' : 'PARTIAL';

            // Update invoice status
            const updatedInvoice = await tx.invoice.update({
                where: { id: invoice.id },
                data: { paymentStatus: newStatus },
                include: { payments: true, patient: { include: { user: true } } }
            });

            // If fully paid and linked to an appointment, mark payment as completed
            // Guard: only update if appointment is NOT still in active consultation stages
            if (newStatus === 'PAID' && invoice.appointmentId) {
                await tx.appointment.updateMany({
                    where: {
                        id: invoice.appointmentId,
                        status: { in: ['MEDICINE_DISPENSED', 'TREATMENT_COMPLETED', 'PRESCRIPTION_GENERATED'] }
                    },
                    data: { status: 'PAYMENT_COMPLETED' }
                }).catch(() => {});
            }

            return { payment, invoice: updatedInvoice };
        });
    }

    // 4. Get Payments List (Ledger)
    async getPayments(filters = {}) {
        const { method, search, startDate, endDate } = filters;
        const whereClause = {};

        if (method && method !== 'ALL') {
            whereClause.paymentMethod = method;
        }

        if (startDate || endDate) {
            whereClause.paidAt = {};
            if (startDate) whereClause.paidAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.paidAt.lte = end;
            }
        }

        if (search) {
            whereClause.OR = [
                { referenceNo: { contains: search, mode: 'insensitive' } },
                { invoice: { patient: { user: { name: { contains: search, mode: 'insensitive' } } } } },
                { invoice: { patient: { patientCode: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        return await prisma.payment.findMany({
            where: whereClause,
            include: {
                invoice: {
                    include: {
                        patient: { include: { user: true } },
                        appointment: {
                            include: {
                                doctor: { include: { user: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { paidAt: 'desc' }
        });
    }

    // 5. Expenses Management
    async getExpenses(filters = {}) {
        const { category, startDate, endDate } = filters;
        const whereClause = {};

        if (category && category !== 'ALL') {
            whereClause.category = category;
        }

        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) whereClause.date.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.date.lte = end;
            }
        }

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            orderBy: { date: 'desc' }
        });

        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

        return { expenses, totalAmount };
    }

    async createExpense(data, user) {
        const { category, amount, date, description } = data;
        const expAmount = parseFloat(amount);

        if (!category || isNaN(expAmount) || expAmount <= 0) {
            throw new AppError('Category and valid amount are required', 400);
        }

        return await prisma.expense.create({
            data: {
                category,
                amount: expAmount,
                date: date ? new Date(date) : new Date(),
                description,
                recordedBy: user?.name || 'Accounts Staff'
            }
        });
    }

    async deleteExpense(id) {
        return await prisma.expense.delete({
            where: { id }
        });
    }

    // 6. Reports Generation
    async getFinancialReports(type, query = {}) {
        const { startDate, endDate } = query;
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        if (type === 'daily_collection') {
            const payments = await prisma.payment.findMany({
                where: Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {},
                include: {
                    invoice: {
                        include: {
                            patient: { include: { user: true } }
                        }
                    }
                },
                orderBy: { paidAt: 'desc' }
            });

            const methodTotals = { CASH: 0, CARD: 0, UPI: 0, ONLINE: 0, INSURANCE: 0 };
            let grandTotal = 0;

            payments.forEach(p => {
                const m = p.paymentMethod?.toUpperCase() || 'CASH';
                methodTotals[m] = (methodTotals[m] || 0) + p.amount;
                grandTotal += p.amount;
            });

            return {
                type: 'daily_collection',
                payments,
                methodTotals,
                grandTotal,
                count: payments.length
            };
        }

        if (type === 'pending_dues') {
            const pendingInvoices = await prisma.invoice.findMany({
                where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
                include: {
                    patient: { include: { user: true } },
                    appointment: { include: { doctor: { include: { user: true } } } },
                    payments: true
                },
                orderBy: { createdAt: 'desc' }
            });

            let totalOutstanding = 0;
            const formatted = pendingInvoices.map(inv => {
                const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                const due = Math.max(0, inv.totalAmount - paid);
                totalOutstanding += due;
                return {
                    ...inv,
                    paidAmount: paid,
                    pendingAmount: due
                };
            });

            return {
                type: 'pending_dues',
                invoices: formatted,
                totalOutstanding,
                count: formatted.length
            };
        }

        if (type === 'expense_report') {
            const expenses = await prisma.expense.findMany({
                where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
                orderBy: { date: 'desc' }
            });

            const categoryTotals = {};
            let grandTotal = 0;

            expenses.forEach(e => {
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
                grandTotal += e.amount;
            });

            return {
                type: 'expense_report',
                expenses,
                categoryTotals,
                grandTotal,
                count: expenses.length
            };
        }

        // Default Payment Report
        const allPayments = await prisma.payment.findMany({
            where: Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {},
            include: {
                invoice: {
                    include: {
                        patient: { include: { user: true } },
                        appointment: { include: { doctor: { include: { user: true } } } }
                    }
                }
            },
            orderBy: { paidAt: 'desc' }
        });

        const totalAmount = allPayments.reduce((s, p) => s + p.amount, 0);
        return {
            type: 'payment_report',
            payments: allPayments,
            totalAmount,
            count: allPayments.length
        };
    }

    // 7. Patient Ledger Search
    async searchPatientLedger(query) {
        if (!query || !query.trim()) {
            return [];
        }

        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { patientCode: { contains: query, mode: 'insensitive' } },
                    { user: { name: { contains: query, mode: 'insensitive' } } },
                    { user: { phone: { contains: query, mode: 'insensitive' } } }
                ]
            },
            include: {
                user: true,
                invoices: {
                    include: {
                        payments: true,
                        appointment: {
                            include: { doctor: { include: { user: true } } }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            take: 10
        });

        return patients.map(patient => {
            let totalBilled = 0;
            let totalPaid = 0;

            const bills = patient.invoices.map(inv => {
                const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                const pending = Math.max(0, inv.totalAmount - paid);
                totalBilled += inv.totalAmount;
                totalPaid += paid;
                return {
                    ...inv,
                    paidAmount: paid,
                    pendingAmount: pending
                };
            });

            return {
                patient,
                totalBilled,
                totalPaid,
                totalOutstanding: Math.max(0, totalBilled - totalPaid),
                bills
            };
        });
    }
}

module.exports = new AccountsService();
