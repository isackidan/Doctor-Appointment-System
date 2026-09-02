const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

class AdminService {
    // 1. Comprehensive Executive Dashboard Metrics
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalPatients,
            totalDoctors,
            totalNurses,
            totalStaff,
            totalAppointments,
            todayAppointments,
            pendingLabTests,
            pendingPrescriptions,
            revenueAgg,
            pendingInvoices,
            lowStockMedicines,
            recentActivities,
            urgentLabRequests,
            pendingDoctors,
            posSalesAgg
        ] = await Promise.all([
            // Total counts
            prisma.patient.count(),
            prisma.doctor.count(),
            prisma.user.count({ where: { role: 'NURSE' } }),
            prisma.user.count({ where: { role: { not: 'PATIENT' } } }),
            prisma.appointment.count(),
            prisma.appointment.count({
                where: { date: { gte: today, lt: tomorrow } }
            }),
            prisma.labRequest.count({
                where: { status: { in: ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS'] } }
            }),
            prisma.prescription.count({
                where: { dispensed: false }
            }),
            // Revenue
            prisma.payment.aggregate({ _sum: { amount: true } }),
            // Pending invoices
            prisma.invoice.findMany({
                where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
                include: { payments: true }
            }),
            // Medicines
            prisma.medicine.findMany({
                include: { stocks: true }
            }),
            // Recent audit logs
            prisma.activityLog.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, email: true, role: true } } }
            }),
            // Urgent lab orders
            prisma.labRequest.findMany({
                where: { priority: 'URGENT', status: { not: 'COMPLETED' } },
                include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
                take: 5
            }),
            // Pending doctor approvals
            prisma.doctor.findMany({
                where: { isApproved: false },
                include: { user: true, department: true }
            }),
            // POS Walk-in sales
            prisma.pharmacySale.aggregate({ _sum: { totalAmount: true } })
        ]);

        // Calculate pending payments
        let totalPendingAmount = 0;
        pendingInvoices.forEach(inv => {
            const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
            totalPendingAmount += Math.max(0, inv.totalAmount - paid);
        });

        // Filter low stock
        const lowStockCount = lowStockMedicines.filter(m => {
            const totalStock = m.stocks.reduce((acc, s) => acc + s.quantity, 0);
            return totalStock <= (m.reorderLevel || 10);
        }).length;

        const totalRevenue = parseFloat(((revenueAgg._sum.amount || 0) + (posSalesAgg._sum.totalAmount || 0)).toFixed(2));

        return {
            totalPatients,
            totalDoctors,
            totalNurses,
            totalStaff,
            totalAppointments,
            todayAppointments,
            pendingLabTests,
            pendingPrescriptions,
            totalRevenue,
            pendingInvoicesCount: pendingInvoices.length,
            totalPendingAmount,
            lowStockCount,
            recentActivities,
            urgentLabRequests,
            pendingDoctorsCount: pendingDoctors.length,
            pendingDoctors
        };
    }

    // 2. User Management
    async getUsers({ search = '', role = '', page = 1, limit = 50 }) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } }
                ]
            } : {}),
            ...(role && role !== 'ALL' ? { role } : {})
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    doctorProfile: {
                        include: { department: true }
                    },
                    patientProfile: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.user.count({ where })
        ]);

        const mappedUsers = users.map(u => ({
            ...u,
            doctor: u.doctorProfile,
            patient: u.patientProfile
        }));

        return {
            users: mappedUsers,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        };
    }

    async createUser(data) {
        const { name, email, phone, role, specialization, consultationFee, hospitalAddress, departmentId } = data;
        if (!name || !email || !role) {
            throw new AppError('Name, Email, and Role are required', 400);
        }

        const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (existing) throw new AppError('A user with this email address already exists', 409);

        // Generate clean random credentials e.g. Lumina@9421
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const rawPassword = `Lumina@${randomDigits}`;
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone ? phone.trim() : null,
                    password: passwordHash,
                    role,
                    isVerified: true
                }
            });

            if (role === 'DOCTOR') {
                await tx.doctor.create({
                    data: {
                        userId: user.id,
                        departmentId: departmentId || undefined,
                        specialization: specialization || 'General Medicine',
                        consultationFee: consultationFee ? parseFloat(consultationFee) : 500.0,
                        hospitalAddress: hospitalAddress || 'Lumina Main Hospital',
                        isApproved: true
                    }
                });
            } else if (role === 'PATIENT') {
                const patientCode = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
                await tx.patient.create({
                    data: {
                        userId: user.id,
                        patientCode
                    }
                });
            }

            return user;
        });

        // WhatsApp Share Link
        const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
        const message = `🏥 *Welcome to Lumina Hospital ERP!*\n\nYour user account (${role}) has been created by Super Admin.\n\n👤 *Name:* ${name}\n📧 *Email / Username:* ${email}\n🔑 *Password:* ${rawPassword}\n🌐 *Login Portal:* http://localhost:5173/login\n\nPlease log in and change your password.`;
        const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : null;

        return {
            user: result,
            rawPassword,
            whatsappLink,
            messageText: message
        };
    }

    async updateUser(userId, data) {
        const { name, phone, role } = data;
        return await prisma.user.update({
            where: { id: userId },
            data: {
                name: name ? name.trim() : undefined,
                phone: phone ? phone.trim() : undefined,
                role: role || undefined
            }
        });
    }

    async resetUserPassword(userId, customPassword) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const newPass = customPassword || `Lumina@${Math.floor(1000 + Math.random() * 9000)}`;
        const hashed = await bcrypt.hash(newPass, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        return { email: user.email, newPassword: newPass };
    }

    async toggleUserStatus(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User account not found', 404);

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isVerified: !user.isVerified }
        });

        return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            isVerified: updated.isVerified,
            statusText: updated.isVerified ? 'ACTIVE' : 'SUSPENDED'
        };
    }

    // 3. Centralized Patient Management
    async getAllPatients({ search = '', limit = 50 }) {
        const where = search ? {
            OR: [
                { patientCode: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { phone: { contains: search, mode: 'insensitive' } } }
            ]
        } : {};

        return await prisma.patient.findMany({
            where,
            include: {
                user: true,
                appointments: {
                    include: { doctor: { include: { user: true } }, department: true },
                    orderBy: { date: 'desc' }
                },
                prescriptions: {
                    include: { items: true, doctor: { include: { user: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                labRequests: {
                    include: { labReport: true, doctor: { include: { user: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                invoices: {
                    include: { payments: true },
                    orderBy: { createdAt: 'desc' }
                },
                vitals: { orderBy: { createdAt: 'desc' }, take: 3 }
            },
            orderBy: { user: { createdAt: 'desc' } },
            take: parseInt(limit)
        });
    }

    // 4. Centralized Doctor Management
    async getAllDoctors({ search = '', departmentId = '' } = {}) {
        const where = {
            ...(departmentId && departmentId !== 'ALL' ? { departmentId } : {}),
            ...(search ? {
                OR: [
                    { specialization: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const doctors = await prisma.doctor.findMany({
            where,
            include: {
                user: true,
                department: true,
                appointments: {
                    include: { patient: { include: { user: true } } },
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { user: { createdAt: 'desc' } }
        });

        return doctors.map(d => ({
            ...d,
            appointmentCount: d.appointments.length
        }));
    }

    async approveDoctor(doctorId) {
        const doctor = await prisma.doctor.findFirst({
            where: { OR: [{ id: doctorId }, { userId: doctorId }] },
            include: { user: true }
        });

        if (!doctor) throw new AppError('Doctor profile not found', 404);

        return await prisma.doctor.update({
            where: { id: doctor.id },
            data: { isApproved: true }
        });
    }

    // 5. Centralized Nurse Management
    async getAllNurses() {
        const nurses = await prisma.user.findMany({
            where: { role: 'NURSE' },
            orderBy: { createdAt: 'desc' }
        });

        const vitalsCounts = await prisma.vital.groupBy({
            by: ['recordedById'],
            _count: true
        });

        const countsMap = {};
        vitalsCounts.forEach(v => {
            countsMap[v.recordedById] = v._count;
        });

        return nurses.map(n => ({
            id: n.id,
            name: n.name,
            email: n.email,
            phone: n.phone,
            isVerified: n.isVerified,
            createdAt: n.createdAt,
            vitalsRecordedCount: countsMap[n.id] || 0,
            shift: 'General Day Shift (8:00 AM - 4:00 PM)'
        }));
    }

    // 6. Centralized Lab Management
    async getAllLabOrders({ status, priority, search } = {}) {
        const where = {
            ...(status && status !== 'ALL' ? { status } : {}),
            ...(priority && priority !== 'ALL' ? { priority } : {}),
            ...(search ? {
                OR: [
                    { testName: { contains: search, mode: 'insensitive' } },
                    { patient: { user: { name: { contains: search, mode: 'insensitive' } } } }
                ]
            } : {})
        };

        return await prisma.labRequest.findMany({
            where,
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                labReport: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 7. Centralized Pharmacy Management
    async getPharmacyOverview() {
        const [prescriptions, medicines] = await Promise.all([
            prisma.prescription.findMany({
                include: {
                    items: true,
                    patient: { include: { user: true } },
                    doctor: { include: { user: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.medicine.findMany({
                include: { stocks: true },
                orderBy: { name: 'asc' }
            })
        ]);

        const inventory = medicines.map(m => {
            const totalStock = m.stocks.reduce((acc, s) => acc + s.quantity, 0);
            return {
                id: m.id,
                name: m.name,
                category: m.category,
                manufacturer: m.manufacturer,
                unitPrice: m.unitPrice,
                reorderLevel: m.reorderLevel || 10,
                totalStock,
                isLowStock: totalStock <= (m.reorderLevel || 10)
            };
        });

        return {
            prescriptions,
            inventory,
            lowStockCount: inventory.filter(i => i.isLowStock).length
        };
    }

    // 8. Centralized Accounts Management
    async getAccountsOverview() {
        const [invoices, payments, expenses] = await Promise.all([
            prisma.invoice.findMany({
                include: {
                    patient: { include: { user: true } },
                    appointment: { include: { doctor: { include: { user: true } } } },
                    payments: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.payment.findMany({
                include: {
                    invoice: { include: { patient: { include: { user: true } } } }
                },
                orderBy: { paidAt: 'desc' }
            }),
            prisma.expense.findMany({
                orderBy: { date: 'desc' }
            })
        ]);

        let totalRevenue = 0;
        payments.forEach(p => totalRevenue += p.amount);

        let totalExpenses = 0;
        expenses.forEach(e => totalExpenses += e.amount);

        let totalPending = 0;
        const enrichedInvoices = invoices.map(inv => {
            const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
            const due = Math.max(0, inv.totalAmount - paid);
            totalPending += due;
            return {
                ...inv,
                paidAmount: paid,
                pendingAmount: due
            };
        });

        return {
            totalRevenue,
            totalExpenses,
            totalPending,
            invoices: enrichedInvoices,
            payments,
            expenses
        };
    }

    // 9. Centralized Appointment Management
    async getAllAppointments({ doctorId, status, date, search } = {}) {
        const where = {
            ...(doctorId && doctorId !== 'ALL' ? { doctorId } : {}),
            ...(status && status !== 'ALL' ? { status } : {}),
            ...(date ? { date: new Date(date) } : {}),
            ...(search ? {
                OR: [
                    { patient: { user: { name: { contains: search, mode: 'insensitive' } } } },
                    { doctor: { user: { name: { contains: search, mode: 'insensitive' } } } }
                ]
            } : {})
        };

        return await prisma.appointment.findMany({
            where,
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                department: true,
                token: true,
                invoice: { include: { payments: true } },
                prescription: true
            },
            orderBy: { date: 'desc' }
        });
    }

    // 10. Centralized Reports
    async getCentralizedReports(reportType, { startDate, endDate } = {}) {
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        switch (reportType) {
            case 'patient': {
                const patients = await prisma.patient.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { user: { createdAt: dateFilter } } : {},
                    include: { user: true, appointments: true, invoices: true },
                    orderBy: { user: { createdAt: 'desc' } }
                });
                return { reportType, count: patients.length, data: patients };
            }
            case 'appointment': {
                const appointments = await prisma.appointment.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
                    include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, department: true },
                    orderBy: { date: 'desc' }
                });
                return { reportType, count: appointments.length, data: appointments };
            }
            case 'doctor': {
                const doctors = await prisma.doctor.findMany({
                    include: { user: true, department: true, appointments: true },
                    orderBy: { user: { createdAt: 'desc' } }
                });
                return { reportType, count: doctors.length, data: doctors };
            }
            case 'lab': {
                const labRequests = await prisma.labRequest.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
                    include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, labReport: true },
                    orderBy: { createdAt: 'desc' }
                });
                return { reportType, count: labRequests.length, data: labRequests };
            }
            case 'pharmacy': {
                const sales = await prisma.prescription.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
                    include: { items: true, patient: { include: { user: true } }, doctor: { include: { user: true } } },
                    orderBy: { createdAt: 'desc' }
                });
                return { reportType, count: sales.length, data: sales };
            }
            case 'billing': {
                const invoices = await prisma.invoice.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
                    include: { patient: { include: { user: true } }, payments: true },
                    orderBy: { createdAt: 'desc' }
                });
                return { reportType, count: invoices.length, data: invoices };
            }
            case 'payment': {
                const payments = await prisma.payment.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {},
                    include: { invoice: { include: { patient: { include: { user: true } } } } },
                    orderBy: { paidAt: 'desc' }
                });
                const total = payments.reduce((acc, p) => acc + p.amount, 0);
                return { reportType, count: payments.length, grandTotal: total, data: payments };
            }
            case 'expense': {
                const expenses = await prisma.expense.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
                    orderBy: { date: 'desc' }
                });
                const total = expenses.reduce((acc, e) => acc + e.amount, 0);
                return { reportType, count: expenses.length, grandTotal: total, data: expenses };
            }
            case 'revenue':
            default: {
                const payments = await prisma.payment.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}
                });
                const expenses = await prisma.expense.findMany({
                    where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}
                });
                const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
                const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
                const netProfit = totalRevenue - totalExpense;
                return {
                    reportType: 'revenue',
                    totalRevenue,
                    totalExpense,
                    netProfit,
                    paymentsCount: payments.length,
                    expensesCount: expenses.length
                };
            }
        }
    }

    // 11. Audit Logs
    async getAuditLogs(limit = 100) {
        return await prisma.activityLog.findMany({
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true, role: true } } }
        });
    }

    // 12. Departments
    async getDepartments() {
        const departments = await prisma.department.findMany({
            include: { _count: { select: { doctors: true, appointments: true } } },
            orderBy: { name: 'asc' }
        });

        return departments.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            doctorCount: d._count.doctors,
            appointmentCount: d._count.appointments
        }));
    }

    async createDepartment({ name, description }) {
        if (!name) throw new AppError('Department name is required', 400);
        const existing = await prisma.department.findUnique({ where: { name: name.trim() } });
        if (existing) throw new AppError(`Department "${name}" already exists`, 409);

        return await prisma.department.create({
            data: {
                name: name.trim(),
                description: description || `${name} Department`
            }
        });
    }

    async deleteDepartment(id) {
        return await prisma.department.delete({ where: { id } });
    }
}

module.exports = new AdminService();
