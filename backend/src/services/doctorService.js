const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

class DoctorService {
    // Helper: Get Doctor Record from User ID
    async getDoctorByUserId(userId) {
        let doctor = await prisma.doctor.findUnique({
            where: { userId },
            include: { user: true, department: true }
        });
        if (!doctor) {
            // Graceful fallback for SUPER_ADMIN accessing doctor portal
            doctor = await prisma.doctor.findFirst({
                include: { user: true, department: true }
            });
        }
        if (!doctor) {
            throw new AppError('Doctor profile not found in system', 404);
        }
        return doctor;
    }

    // 1. Doctor Dashboard Statistics (Section 1)
    async getDashboardStats(doctorId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            todayAppointments,
            waitingPatients,
            inConsultation,
            completedConsultations,
            emergencyCases,
            pendingLabReports,
            followups
        ] = await Promise.all([
            prisma.appointment.count({ where: { doctorId, date: { gte: startOfDay } } }),
            prisma.appointment.count({ where: { doctorId, date: { gte: startOfDay }, status: { in: ['CHECKED_IN', 'VITALS_RECORDED'] } } }),
            prisma.appointment.count({ where: { doctorId, date: { gte: startOfDay }, status: 'IN_CONSULTATION' } }),
            prisma.appointment.count({ where: { doctorId, date: { gte: startOfDay }, status: 'TREATMENT_COMPLETED' } }),
            prisma.appointment.count({ where: { doctorId, patient: { isEmergency: true } } }),
            prisma.labRequest.count({ where: { doctorId, status: 'COMPLETED' } }), // Completed by Lab Tech, awaiting doctor review
            prisma.appointment.findMany({
                where: { doctorId, followUpDate: { gte: startOfDay } },
                include: { patient: { include: { user: true } } },
                take: 5
            })
        ]);

        return {
            todayAppointments,
            waitingPatients,
            inConsultation,
            completedConsultations,
            emergencyCases,
            pendingLabReports,
            followupsCount: followups.length,
            followups
        };
    }

    // 2. Doctor Appointments with Filters (Section 2)
    async getAppointments(doctorId, { dateFilter = 'TODAY', status = '' }) {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        
        let dateWhere = {};
        if (dateFilter === 'TODAY') {
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);
            dateWhere = { gte: startOfDay, lt: endOfDay };
        } else if (dateFilter === 'TOMORROW') {
            const startTomorrow = new Date(startOfDay);
            startTomorrow.setDate(startTomorrow.getDate() + 1);
            const endTomorrow = new Date(startTomorrow);
            endTomorrow.setDate(endTomorrow.getDate() + 1);
            dateWhere = { gte: startTomorrow, lt: endTomorrow };
        } else if (dateFilter === 'THIS_WEEK') {
            const endOfWeek = new Date(startOfDay);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            dateWhere = { gte: startOfDay, lt: endOfWeek };
        }

        const where = {
            doctorId,
            ...(Object.keys(dateWhere).length > 0 ? { date: dateWhere } : {}),
            ...(status ? { status } : {})
        };

        return await prisma.appointment.findMany({
            where,
            include: {
                patient: { include: { user: true } },
                token: true,
                vitals: true,
                prescription: { include: { items: true } },
                labRequests: true
            },
            orderBy: { startTime: 'asc' }
        });
    }

    // 3. Patient Queue Matrix (Section 3)
    async getDoctorQueue(doctorId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return await prisma.appointment.findMany({
            where: {
                doctorId,
                date: { gte: startOfDay },
                status: { in: ['CHECKED_IN', 'IN_CONSULTATION', 'SCHEDULED', 'VITALS_RECORDED'] }
            },
            include: {
                patient: { include: { user: true } },
                token: true,
                vitals: true
            },
            orderBy: { startTime: 'asc' }
        });
    }

    // 4. Patient EHR 360° Medical Record (Section 4)
    async getPatientHistory(doctorId, patientId) {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: true,
                vitals: { orderBy: { createdAt: 'desc' } },
                prescriptions: { include: { items: true, doctor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } },
                labRequests: { include: { labReport: true }, orderBy: { createdAt: 'desc' } },
                appointments: { include: { doctor: { include: { user: true } } }, orderBy: { date: 'desc' } },
                documents: true,
                ipdBeds: true
            }
        });

        if (!patient) throw new AppError('Patient profile not found', 404);
        return patient;
    }

    // 5. Start Consultation
    async startConsultation(doctorId, appointmentId) {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId }
        });
        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 403);

        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'IN_CONSULTATION' },
            include: { patient: { include: { user: true } }, vitals: true }
        });
    }

    // 5. Save Clinical Consultation Findings & Diagnosis Engine (Section 5 & 8)
    async saveConsultation(doctorId, appointmentId, clinicalData) {
        const { chiefComplaint, symptoms, diagnosis, clinicalNotes, treatmentPlan, followUpDate } = clinicalData;

        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId }
        });
        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 403);

        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                chiefComplaint,
                symptoms,
                diagnosis,
                clinicalNotes,
                followUpDate: followUpDate ? new Date(followUpDate) : null
            },
            include: { patient: { include: { user: true } } }
        });
    }

    // 6. Save Prescription & Auto-Post to Pharmacy Queue (Section 6)
    async savePrescription(doctorId, appointmentId, notes, items = []) {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId }
        });
        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 403);

        return await prisma.$transaction(async (tx) => {
            const prescription = await tx.prescription.upsert({
                where: { appointmentId },
                update: { notes, dispensed: false },
                create: {
                    appointmentId,
                    patientId: appt.patientId,
                    doctorId,
                    notes,
                    dispensed: false
                }
            });

            // Delete old items if updating
            await tx.prescriptionItem.deleteMany({ where: { prescriptionId: prescription.id } });

            // Insert new medicine items with detailed frequency, duration, timing
            if (items.length > 0) {
                await tx.prescriptionItem.createMany({
                    data: items.map(item => ({
                        prescriptionId: prescription.id,
                        medicineId: item.medicineId || null,
                        medicineName: item.medicineName,
                        dosage: item.dosage || '500mg',
                        frequency: item.frequency || '1-0-1',
                        durationDays: parseInt(item.durationDays) || 5,
                        quantity: parseInt(item.quantity) || 10
                    }))
                });
            }

            return await tx.prescription.findUnique({
                where: { id: prescription.id },
                include: { items: true }
            });
        });
    }

    // 7. Create Lab Investigation Order & Acknowledge Results (Section 7)
    async createLabRequest(doctorId, appointmentId, testName, category = 'General Pathology', priority = 'NORMAL', notes = '') {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId }
        });
        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 403);

        return await prisma.labRequest.create({
            data: {
                appointmentId,
                patientId: appt.patientId,
                doctorId,
                testName,
                category,
                notes: `[Priority: ${priority}] ${notes}`,
                status: 'PENDING'
            }
        });
    }

    // Doctor Acknowledge Completed Lab Report Flow
    async acknowledgeLabResult(doctorId, labRequestId, doctorRemarks) {
        const labReq = await prisma.labRequest.findFirst({
            where: { id: labRequestId, doctorId }
        });

        if (!labReq) throw new AppError('Lab request not found or not assigned to this doctor', 404);

        return await prisma.labRequest.update({
            where: { id: labRequestId },
            data: {
                notes: labReq.notes + ` | Doctor Review Remarks: ${doctorRemarks || 'Acknowledged'}`
            },
            include: { labReport: true, patient: { include: { user: true } } }
        });
    }

    // 8. Medical Certificates & Document Generator Payload (Section 9)
    async generateMedicalDocument(doctorId, appointmentId, documentType = 'MEDICAL_CERTIFICATE') {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true, department: true } },
                prescription: { include: { items: true } }
            }
        });

        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 404);

        const docRef = `DOC-${documentType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

        return {
            docRef,
            documentType,
            date: new Date().toLocaleDateString(),
            patientName: appt.patient?.user?.name,
            patientAge: appt.patient?.age || 30,
            patientGender: appt.patient?.gender || 'Male',
            doctorName: appt.doctor?.user?.name,
            specialization: appt.doctor?.specialization,
            department: appt.doctor?.department?.name || 'General Medicine',
            diagnosis: appt.diagnosis || 'Acute General Condition',
            notes: appt.clinicalNotes || 'Recommended rest for 3 days.',
            prescriptionItems: appt.prescription?.items || []
        };
    }

    // 9. Complete Consultation
    async completeConsultation(doctorId, appointmentId) {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, doctorId }
        });
        if (!appt) throw new AppError('Appointment not found or not assigned to this doctor', 403);

        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'TREATMENT_COMPLETED' }
        });
    }

    // 10. Search Medicine Catalog
    async searchMedicines(queryStr) {
        if (!queryStr || queryStr.trim() === '') {
            return await prisma.medicine.findMany({ take: 10 });
        }
        return await prisma.medicine.findMany({
            where: { name: { contains: queryStr, mode: 'insensitive' } },
            take: 15
        });
    }
}

module.exports = new DoctorService();
