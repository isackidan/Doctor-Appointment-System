const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

class NurseService {
    // 1. Dashboard Statistics & Critical Alerts (Section 1 & 12)
    async getDashboardStats() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            todayAssigned,
            waitingVitals,
            vitalsRecorded,
            completedTasks,
            emergencyPatients,
            criticalVitals,
            recentActivity
        ] = await Promise.all([
            prisma.appointment.count({ where: { date: { gte: startOfDay } } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'CHECKED_IN' } }),
            prisma.appointment.count({ where: { date: { gte: startOfDay }, status: 'VITALS_RECORDED' } }),
            prisma.vital.count({ where: { createdAt: { gte: startOfDay } } }),
            prisma.appointment.findMany({
                where: { date: { gte: startOfDay }, patient: { isEmergency: true } },
                include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, token: true }
            }),
            prisma.vital.findMany({
                where: { createdAt: { gte: startOfDay }, OR: [{ spo2: { lt: 95 } }, { temperature: { gt: 100.4 } }] },
                include: { patient: { include: { user: true } } },
                take: 5
            }),
            prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                where: { module: 'NURSE' },
                include: { user: { select: { name: true, role: true } } }
            })
        ]);

        return {
            todayAssigned,
            waitingVitals,
            vitalsRecorded,
            completedTasks,
            emergencyCount: emergencyPatients.length,
            emergencyPatients,
            criticalVitalsCount: criticalVitals.length,
            criticalVitals,
            recentActivity
        };
    }

    // 2. Triage Queue (Section 2)
    async getNurseQueue() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return await prisma.appointment.findMany({
            where: {
                date: { gte: startOfDay },
                status: { in: ['CHECKED_IN', 'VITALS_RECORDED', 'IN_CONSULTATION'] }
            },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                department: true,
                token: true,
                vitals: true
            },
            orderBy: { startTime: 'asc' }
        });
    }

    // 3. Patients & EHR Search (Section 3)
    async searchAssignedPatients(queryStr = '') {
        return await prisma.patient.findMany({
            where: queryStr ? {
                OR: [
                    { patientCode: { contains: queryStr, mode: 'insensitive' } },
                    { user: { name: { contains: queryStr, mode: 'insensitive' } } },
                    { user: { phone: { contains: queryStr, mode: 'insensitive' } } }
                ]
            } : {},
            include: {
                user: true,
                vitals: { orderBy: { createdAt: 'desc' }, take: 3 },
                prescriptions: { include: { items: true }, take: 3 },
                appointments: { take: 3, orderBy: { date: 'desc' } },
                ipdBeds: true
            },
            take: 20
        });
    }

    // 4. Record Vitals & Auto-Calculate BMI (Section 4)
    async recordVitals(nurseId, appointmentId, vitalsData) {
        const {
            height, weight, bloodPressure, pulseRate, temperature,
            respiratoryRate, spo2, bloodSugar, painScale, notes
        } = vitalsData;

        const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt) throw new AppError('Appointment not found', 404);

        // Auto-Calculate BMI (kg/m2)
        let bmi = null;
        if (weight && height && parseFloat(height) > 0) {
            const heightInMeters = parseFloat(height) / 100;
            bmi = parseFloat((parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(2));
        }

        return await prisma.$transaction(async (tx) => {
            const vital = await tx.vital.upsert({
                where: { appointmentId },
                update: {
                    recordedById: nurseId,
                    height: height ? parseFloat(height) : null,
                    weight: weight ? parseFloat(weight) : null,
                    bmi,
                    bloodPressure: bloodPressure || '120/80',
                    pulseRate: pulseRate ? parseInt(pulseRate) : 72,
                    temperature: temperature ? parseFloat(temperature) : 98.6,
                    respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : 18,
                    spo2: spo2 ? parseInt(spo2) : 98,
                    bloodSugar: bloodSugar ? parseFloat(bloodSugar) : 100,
                    painScale: painScale ? parseInt(painScale) : 0,
                    notes: notes || 'Normal vital check recorded'
                },
                create: {
                    appointmentId,
                    patientId: appt.patientId,
                    recordedById: nurseId,
                    height: height ? parseFloat(height) : null,
                    weight: weight ? parseFloat(weight) : null,
                    bmi,
                    bloodPressure: bloodPressure || '120/80',
                    pulseRate: pulseRate ? parseInt(pulseRate) : 72,
                    temperature: temperature ? parseFloat(temperature) : 98.6,
                    respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : 18,
                    spo2: spo2 ? parseInt(spo2) : 98,
                    bloodSugar: bloodSugar ? parseFloat(bloodSugar) : 100,
                    painScale: painScale ? parseInt(painScale) : 0,
                    notes: notes || 'Normal vital check recorded'
                }
            });

            // Auto-transition status to VITALS_RECORDED
            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'VITALS_RECORDED' }
            });

            return vital;
        });
    }

    // 5. Doctor Instructions (Section 5)
    async getDoctorInstructions(patientId) {
        const appts = await prisma.appointment.findMany({
            where: patientId ? { patientId } : {},
            include: {
                doctor: { include: { user: true } },
                patient: { include: { user: true } }
            },
            orderBy: { date: 'desc' },
            take: 15
        });

        return appts.map(a => ({
            appointmentId: a.id,
            patientName: a.patient?.user?.name,
            doctorName: a.doctor?.user?.name,
            instructions: a.clinicalNotes || a.reason || 'General OPD Nursing Care Instructions',
            date: a.date,
            status: a.status === 'TREATMENT_COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
        }));
    }

    // 6. Medication Administration Log (Section 6)
    async getPrescriptionsForNurse(patientId) {
        return await prisma.prescription.findMany({
            where: patientId ? { patientId } : {},
            include: {
                items: {
                    include: {
                        medicationLogs: {
                            orderBy: { administeredAt: 'desc' },
                            take: 1
                        }
                    }
                },
                doctor: { include: { user: true } },
                patient: { include: { user: true } },
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async logMedication(nurseId, prescriptionItemId, status = 'GIVEN', remarks = '') {
        return await prisma.medicationAdministrationLog.create({
            data: {
                prescriptionItemId,
                nurseId,
                status,
                remarks: remarks || `Medication ${status.toLowerCase()} by Nurse`
            }
        });
    }

    // 7. Save Nursing Observation Note (Section 8)
    async saveNursingNote(nurseId, appointmentId, noteData) {
        const { consciousLevel, mobility, foodIntake, urineOutput, sleepStatus, painLevel, notes } = noteData;

        const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt) throw new AppError('Appointment not found', 404);

        return await prisma.nursingNote.create({
            data: {
                appointmentId,
                patientId: appt.patientId,
                nurseId,
                consciousLevel: consciousLevel || 'Alert',
                mobility: mobility || 'Ambulatory',
                foodIntake: foodIntake || 'Normal',
                urineOutput: urineOutput || 'Adequate',
                sleepStatus: sleepStatus || 'Restful',
                painLevel: painLevel ? parseInt(painLevel) : 0,
                notes: notes || 'Routine nursing observation recorded'
            }
        });
    }

    // 8. Ward & Bed Management (Section 9)
    async getWardBeds() {
        return await prisma.iPDBedAllocation.findMany({
            include: { patient: { include: { user: true } } },
            orderBy: { assignedAt: 'desc' }
        });
    }

    async assignBed(patientId, wardCategory, bedNumber, reason) {
        return await prisma.iPDBedAllocation.create({
            data: {
                patientId,
                wardCategory: wardCategory || 'General Ward',
                bedNumber: bedNumber || `BED-${Math.floor(100 + Math.random() * 900)}`,
                reason: reason || 'Nursing Ward Allocation'
            }
        });
    }
}

module.exports = new NurseService();
