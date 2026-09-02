const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

class PatientService {
    // Helper to get or auto-create patient profile for user
    async getPatient(userId) {
        let patient = await prisma.patient.findUnique({
            where: { userId },
            include: { user: true }
        });

        if (!patient) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new AppError('User not found', 404);

            const randomCode = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
            patient = await prisma.patient.create({
                data: {
                    userId: user.id,
                    patientCode: randomCode
                },
                include: { user: true }
            });
        }

        return patient;
    }

    // 1. Dashboard Summary
    async getDashboardSummary(userId) {
        const patient = await this.getPatient(userId);

        const [nextAppointment, recentPrescription, latestInvoice, recentLabRequest, unreadCount, totalAppointments] = await Promise.all([
            // Next appointment
            prisma.appointment.findFirst({
                where: {
                    patientId: patient.id,
                    status: { in: ['SCHEDULED', 'CHECKED_IN', 'VITALS_RECORDED', 'IN_CONSULTATION'] }
                },
                include: {
                    doctor: { include: { user: true } },
                    department: true
                },
                orderBy: { date: 'asc' }
            }),
            // Recent prescription
            prisma.prescription.findFirst({
                where: { patientId: patient.id },
                include: {
                    items: true,
                    doctor: { include: { user: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Pending/latest invoice
            prisma.invoice.findFirst({
                where: { patientId: patient.id },
                include: {
                    payments: true,
                    appointment: { include: { doctor: { include: { user: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Recent lab request
            prisma.labRequest.findFirst({
                where: { patientId: patient.id },
                include: {
                    labReport: true,
                    doctor: { include: { user: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Unread notifications
            prisma.notification.count({
                where: { userId, isRead: false }
            }),
            // Total visits
            prisma.appointment.count({
                where: { patientId: patient.id }
            })
        ]);

        // Calculate pending invoice amounts
        let pendingBill = null;
        if (latestInvoice) {
            const paid = latestInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
            const pending = Math.max(0, latestInvoice.totalAmount - paid);
            pendingBill = {
                ...latestInvoice,
                paidAmount: paid,
                pendingAmount: pending
            };
        }

        return {
            patient: {
                id: patient.id,
                patientCode: patient.patientCode,
                name: patient.user?.name,
                email: patient.user?.email,
                phone: patient.user?.phone,
                bloodGroup: patient.bloodGroup,
                age: patient.age,
                gender: patient.gender,
                allergies: patient.allergies,
                address: patient.address,
                emergencyContact: patient.emergencyContact
            },
            nextAppointment,
            recentPrescription,
            pendingBill,
            recentLabRequest,
            unreadCount,
            totalAppointments
        };
    }

    // 2. Profile Management
    async getProfile(userId) {
        const patient = await this.getPatient(userId);
        return {
            id: patient.id,
            patientCode: patient.patientCode,
            name: patient.user?.name,
            email: patient.user?.email,
            phone: patient.user?.phone,
            dob: patient.dob,
            age: patient.age,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            address: patient.address,
            city: patient.city,
            state: patient.state,
            emergencyContact: patient.emergencyContact,
            allergies: patient.allergies,
            medicalHistory: patient.medicalHistory,
            insuranceProvider: patient.insuranceProvider,
            policyNumber: patient.policyNumber,
            createdAt: patient.user?.createdAt
        };
    }

    async updateProfile(userId, profileData) {
        const patient = await this.getPatient(userId);
        const {
            name,
            phone,
            dob,
            age,
            gender,
            bloodGroup,
            address,
            city,
            state,
            emergencyContact,
            allergies,
            medicalHistory,
            insuranceProvider,
            policyNumber
        } = profileData;

        return await prisma.$transaction(async (tx) => {
            // Update core user
            if (name || phone !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        name: name || undefined,
                        phone: phone || undefined
                    }
                });
            }

            // Update patient profile
            const updatedPatient = await tx.patient.update({
                where: { id: patient.id },
                data: {
                    dob: dob ? new Date(dob) : undefined,
                    age: age ? parseInt(age) : undefined,
                    gender: gender || undefined,
                    bloodGroup: bloodGroup || undefined,
                    address: address || undefined,
                    city: city || undefined,
                    state: state || undefined,
                    emergencyContact: emergencyContact || undefined,
                    allergies: allergies || undefined,
                    medicalHistory: medicalHistory || undefined,
                    insuranceProvider: insuranceProvider || undefined,
                    policyNumber: policyNumber || undefined
                },
                include: { user: true }
            });

            return updatedPatient;
        });
    }

    // 3. Appointments
    async getAppointments(userId) {
        const patient = await this.getPatient(userId);

        const appointments = await prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: { include: { user: true } },
                department: true,
                prescription: true,
                invoice: { include: { payments: true } },
                token: true
            },
            orderBy: { date: 'desc' }
        });

        const now = new Date();
        const upcoming = [];
        const previous = [];

        appointments.forEach(appt => {
            const isCompletedOrPast = ['TREATMENT_COMPLETED', 'PAYMENT_COMPLETED', 'CANCELLED'].includes(appt.status) || new Date(appt.date) < now;
            if (isCompletedOrPast && appt.status !== 'SCHEDULED') {
                previous.push(appt);
            } else {
                upcoming.push(appt);
            }
        });

        return { upcoming, previous, all: appointments };
    }

    // 4. Prescriptions
    async getPrescriptions(userId) {
        const patient = await this.getPatient(userId);

        return await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: {
                items: true,
                doctor: { include: { user: true, department: true } },
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 5. Lab Reports
    async getLabReports(userId) {
        const patient = await this.getPatient(userId);

        return await prisma.labRequest.findMany({
            where: { patientId: patient.id },
            include: {
                labReport: true,
                doctor: { include: { user: true } },
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 6. Bills & Payments
    async getBills(userId) {
        const patient = await this.getPatient(userId);

        const invoices = await prisma.invoice.findMany({
            where: { patientId: patient.id },
            include: {
                payments: { orderBy: { paidAt: 'desc' } },
                appointment: {
                    include: {
                        doctor: { include: { user: true } },
                        department: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

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

    // 7. Notifications
    async getNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async markNotificationRead(userId, notificationId) {
        return await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }

    async markAllNotificationsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId },
            data: { isRead: true }
        });
    }

    // 8. Settings & Change Password
    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new AppError('Current and new password are required', 400);
        }

        if (newPassword.length < 6) {
            throw new AppError('New password must be at least 6 characters long', 400);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError('Incorrect current password', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true, message: 'Password updated successfully' };
    }
}

module.exports = new PatientService();
