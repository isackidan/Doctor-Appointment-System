const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

class ReceptionistService {
    // 1. Reception Dashboard Statistics & Live Queue Summary
    async getDashboardStats() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            todayAppointments,
            todayCheckins,
            pendingAppointments,
            completedAppointments,
            cancelledAppointments,
            emergencyCount,
            totalPatients,
            todayTokens
        ] = await Promise.all([
            prisma.appointment.count({ where: { date: { gte: startOfDay } } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'CHECKED_IN' } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'SCHEDULED' } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'TREATMENT_COMPLETED' } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'CANCELLED' } }),
            prisma.patient.count({ where: { isEmergency: true } }),
            prisma.patient.count(),
            prisma.token.findMany({
                where: { createdAt: { gte: startOfDay } },
                include: { appointment: { include: { patient: { include: { user: true } }, doctor: { include: { user: true } } } } },
                orderBy: { createdAt: 'asc' }
            })
        ]);

        return {
            todayAppointments,
            todayCheckins,
            pendingAppointments,
            completedAppointments,
            cancelledAppointments,
            emergencyCount,
            totalPatients,
            todayTokens: todayTokens.map(t => ({
                tokenId: t.id,
                tokenNumber: t.tokenNumber,
                status: t.status,
                patientName: t.appointment?.patient?.user?.name || 'Walk-in Patient',
                patientCode: t.appointment?.patient?.patientCode || 'PAT-2026-0001',
                doctorName: t.appointment?.doctor?.user?.name || 'Dr. Vance',
                startTime: t.appointment?.startTime || '10:00 AM'
            }))
        };
    }

    // 2. Emergency Fast-Track Intake (Trauma/ER Direct Ticket)
    async registerEmergencyIntake(data) {
        const { name, phone, age, gender, doctorId, traumaRoom, notes } = data;

        if (!name) throw new AppError('Emergency Patient Name is required', 400);

        const patientEmail = `emergency_${Date.now()}@lumina.hospital`;
        const count = await prisma.patient.count();
        const patientCode = `EMG-2026-${String(count + 1).padStart(4, '0')}`;
        const passwordHash = await bcrypt.hash('emergency123', 10);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: `🚨 ${name}`,
                    email: patientEmail,
                    phone: phone || 'EMERGENCY-DESK',
                    password: passwordHash,
                    role: 'PATIENT',
                    isVerified: true
                }
            });

            const patient = await tx.patient.create({
                data: {
                    patientCode,
                    userId: user.id,
                    age: age ? parseInt(age) : 30,
                    gender: gender || 'Unspecified',
                    bloodGroup: 'O+',
                    isEmergency: true,
                    medicalHistory: `TRAUMA INTAKE: ${notes || 'Immediate Emergency Care'}`
                },
                include: { user: true }
            });

            // Find first doctor if not passed
            let targetDoctorId = doctorId;
            if (!targetDoctorId) {
                const doc = await tx.doctor.findFirst({ where: { isApproved: true } });
                targetDoctorId = doc ? doc.id : null;
            }

            const appointment = await tx.appointment.create({
                data: {
                    patientId: patient.id,
                    doctorId: targetDoctorId,
                    date: new Date(),
                    startTime: 'NOW (EMERGENCY)',
                    endTime: 'IMMEDIATE',
                    reason: `EMERGENCY TRAUMA INTAKE - Room ${traumaRoom || 'ER-1'}`,
                    doctorFee: 1000.0,
                    adminCommission: 100.0,
                    totalFee: 1100.0,
                    status: 'CHECKED_IN'
                },
                include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
            });

            const tokenCount = await tx.token.count();
            const token = await tx.token.create({
                data: {
                    tokenNumber: `EMG-${101 + tokenCount}`,
                    appointmentId: appointment.id,
                    patientId: patient.id,
                    status: 'IN_TRIAGE'
                }
            });

            return { patient, appointment, token };
        });
    }

    // 3. Search Patients (by Code, Phone, Name, Email, Appt ID)
    async searchPatients(queryStr) {
        if (!queryStr || queryStr.trim() === '') {
            return await prisma.patient.findMany({
                take: 20,
                orderBy: { user: { createdAt: 'desc' } },
                include: { user: true, appointments: { take: 1, orderBy: { createdAt: 'desc' } } }
            });
        }

        const q = queryStr.trim();

        return await prisma.patient.findMany({
            where: {
                OR: [
                    { patientCode: { contains: q, mode: 'insensitive' } },
                    { user: { name: { contains: q, mode: 'insensitive' } } },
                    { user: { email: { contains: q, mode: 'insensitive' } } },
                    { user: { phone: { contains: q, mode: 'insensitive' } } },
                    { alternatePhone: { contains: q, mode: 'insensitive' } },
                    { appointments: { some: { id: { contains: q, mode: 'insensitive' } } } }
                ]
            },
            include: {
                user: true,
                appointments: { take: 5, orderBy: { createdAt: 'desc' }, include: { doctor: { include: { user: true } } } }
            }
        });
    }

    // 4. Register Normal Patient
    async registerPatient(data) {
        const {
            name, email, phone, alternatePhone, dob, age, gender, bloodGroup,
            address, city, state, emergencyContact, insuranceProvider,
            policyNumber, medicalHistory, allergies, isEmergency
        } = data;

        if (!name || !phone) {
            throw new AppError('Patient Name and Phone Number are required', 400);
        }

        const patientEmail = email || `patient_${Date.now()}@lumina.hospital`;
        const existing = await prisma.user.findUnique({ where: { email: patientEmail } });
        if (existing) {
            throw new AppError('A patient account with this email already exists', 400);
        }

        const count = await prisma.patient.count();
        const patientCode = `PAT-2026-${String(count + 1).padStart(4, '0')}`;
        const passwordHash = await bcrypt.hash('password123', 10);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email: patientEmail,
                    phone,
                    password: passwordHash,
                    role: 'PATIENT',
                    isVerified: true
                }
            });

            const patient = await tx.patient.create({
                data: {
                    patientCode,
                    userId: user.id,
                    dob: dob ? new Date(dob) : null,
                    age: age ? parseInt(age) : null,
                    gender: gender || 'Unspecified',
                    bloodGroup: bloodGroup || 'O+',
                    alternatePhone,
                    address,
                    city,
                    state,
                    emergencyContact,
                    insuranceProvider,
                    policyNumber,
                    medicalHistory,
                    allergies,
                    isEmergency: Boolean(isEmergency)
                },
                include: { user: true }
            });

            return patient;
        });
    }

    // 5. Book OPD Appointment & Auto Token
    async bookAppointment(data) {
        const { patientId, doctorId, date, startTime, endTime, reason } = data;

        if (!patientId || !doctorId || !date || !startTime) {
            throw new AppError('Patient, Doctor, Date, and Time slot are required', 400);
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: true }
        });
        if (!doctor) throw new AppError('Doctor not found', 404);

        const todayCount = await prisma.token.count();
        const tokenNumber = `TK-${101 + todayCount}`;

        return await prisma.$transaction(async (tx) => {
            const appointment = await tx.appointment.create({
                data: {
                    patientId,
                    doctorId,
                    departmentId: doctor.departmentId,
                    date: new Date(date),
                    startTime,
                    endTime: endTime || startTime,
                    reason: reason || 'General OPD Consultation',
                    doctorFee: doctor.consultationFee,
                    adminCommission: doctor.consultationFee * 0.1,
                    totalFee: doctor.consultationFee * 1.1,
                    status: 'SCHEDULED'
                },
                include: {
                    patient: { include: { user: true } },
                    doctor: { include: { user: true } }
                }
            });

            const token = await tx.token.create({
                data: {
                    tokenNumber,
                    appointmentId: appointment.id,
                    patientId,
                    status: 'WAITING'
                }
            });

            return { appointment, token };
        });
    }

    // 6. Reschedule Appointment
    async rescheduleAppointment(appointmentId, newDate, newStartTime, newEndTime) {
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                date: new Date(newDate),
                startTime: newStartTime,
                endTime: newEndTime || newStartTime,
                status: 'SCHEDULED'
            },
            include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
        });
    }

    // 7. Update Token Status (Call Patient / Skip)
    async updateTokenStatus(tokenId, status) {
        return await prisma.token.update({
            where: { id: tokenId },
            data: { status }
        });
    }

    // 8. Cancel Appointment
    async cancelAppointment(appointmentId, reason) {
        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CANCELLED',
                reason: reason ? `Cancelled by Reception: ${reason}` : 'Cancelled by Reception'
            }
        });
    }

    // 9. Check In Patient
    async updateStatus(appointmentId, status) {
        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
            include: { token: true }
        });
    }

    // 10. Collect OPD Consultation Fee & Issue Ticket Slip
    async collectFee(appointmentId, amount, paymentMethod = 'CASH') {
        const appt = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, token: true }
        });
        if (!appt) throw new AppError('Appointment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.upsert({
                where: { appointmentId },
                update: { paymentStatus: 'PAID' },
                create: {
                    appointmentId,
                    patientId: appt.patientId,
                    subTotal: appt.totalFee,
                    totalAmount: parseFloat(amount) || appt.totalFee,
                    paymentStatus: 'PAID'
                }
            });

            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: parseFloat(amount) || appt.totalFee,
                    paymentMethod,
                    referenceNo: `OPD-${Date.now().toString().slice(-6)}`
                }
            });

            return { appt, invoice, payment };
        });
    }

    // 11. Patient 360° Profile & Treatment History Timeline Aggregation
    async getPatient360History(patientId) {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: true,
                appointments: {
                    include: {
                        doctor: { include: { user: true } },
                        vitals: true,
                        prescription: { include: { items: true } },
                        labRequests: true,
                        invoice: { include: { payments: true } },
                        token: true
                    },
                    orderBy: { date: 'desc' }
                },
                documents: true,
                ipdBeds: { orderBy: { assignedAt: 'desc' } }
            }
        });

        if (!patient) throw new AppError('Patient profile not found', 404);
        return patient;
    }

    // 12. IPD Bed Allocation Request (Inpatient Desk)
    async requestIPDBedAllocation(patientId, wardCategory, bedNumber, reason) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) throw new AppError('Patient record not found', 404);

        return await prisma.iPDBedAllocation.create({
            data: {
                patientId,
                wardCategory: wardCategory || 'General Ward',
                bedNumber: bedNumber || `BED-${Math.floor(100 + Math.random() * 900)}`,
                reason: reason || 'Inpatient Admission Recommended'
            }
        });
    }

    // 13. Patient Document Uploader
    async uploadPatientDocument(patientId, name, fileUrl, type = 'ID_PROOF') {
        return await prisma.document.create({
            data: {
                patientId,
                name,
                fileUrl: fileUrl || '/uploads/sample_doc.pdf',
                type
            }
        });
    }

    // 14. Format WhatsApp OPD Ticket Payload & URL
    async getWhatsAppTicketPayload(appointmentId) {
        const appt = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                token: true
            }
        });

        if (!appt) throw new AppError('Appointment not found', 404);

        const phone = appt.patient?.user?.phone || '';
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        const message = `🏥 *Lumina Health System OPD Ticket*\n\n` +
            `👤 *Patient:* ${appt.patient?.user?.name} (${appt.patient?.patientCode})\n` +
            `🎫 *Token #:* ${appt.token?.tokenNumber || 'TK-101'}\n` +
            `👨‍⚕️ *Doctor:* Dr. ${appt.doctor?.user?.name}\n` +
            `🕒 *Time Slot:* ${appt.startTime} on ${new Date(appt.date).toLocaleDateString()}\n` +
            `📍 *Location:* OPD Main Block, Room 204\n\n` +
            `Please show this token ticket at the triage desk. Get well soon! 💙`;

        const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : null;

        return {
            appointmentId: appt.id,
            patientName: appt.patient?.user?.name,
            patientPhone: appt.patient?.user?.phone,
            tokenNumber: appt.token?.tokenNumber,
            message,
            whatsappUrl
        };
    }
}

module.exports = new ReceptionistService();
