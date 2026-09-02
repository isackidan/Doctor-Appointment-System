const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

class WorkflowService {
    // 1. Receptionist: Check In Patient
    async checkInPatient(appointmentId) {
        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CHECKED_IN' },
            include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
        });
    }

    // 2. Nurse: Record Vitals
    async recordVitals(appointmentId, recordedById, vitalsData) {
        const { bloodPressure, pulseRate, temperature, weight, spo2, notes } = vitalsData;

        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const vital = await tx.vital.upsert({
                where: { appointmentId },
                update: {
                    bloodPressure,
                    pulseRate: pulseRate ? parseInt(pulseRate) : null,
                    temperature: temperature ? parseFloat(temperature) : null,
                    weight: weight ? parseFloat(weight) : null,
                    spo2: spo2 ? parseInt(spo2) : null,
                    notes
                },
                create: {
                    appointmentId,
                    patientId: appointment.patientId,
                    recordedById,
                    bloodPressure,
                    pulseRate: pulseRate ? parseInt(pulseRate) : null,
                    temperature: temperature ? parseFloat(temperature) : null,
                    weight: weight ? parseFloat(weight) : null,
                    spo2: spo2 ? parseInt(spo2) : null,
                    notes
                }
            });

            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'VITALS_RECORDED' }
            });

            return vital;
        });
    }

    // 3. Doctor: Start Consultation
    async startConsultation(appointmentId) {
        return await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'IN_CONSULTATION' }
        });
    }

    // 4. Doctor: Request Lab Test
    async createLabRequest(appointmentId, doctorUserId, testName, category, notes) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true }
        });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const labReq = await tx.labRequest.create({
                data: {
                    appointmentId,
                    patientId: appointment.patientId,
                    doctorId: appointment.doctor.id,
                    testName,
                    category,
                    notes
                }
            });

            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'LAB_REQUESTED' }
            });

            return labReq;
        });
    }

    // 5. Lab Tech: Upload Report
    async uploadLabReport(labRequestId, technicianId, resultData, reportUrl, remarks) {
        const labReq = await prisma.labRequest.findUnique({ where: { id: labRequestId } });
        if (!labReq) throw new AppError('Lab request not found', 404);

        return await prisma.$transaction(async (tx) => {
            const report = await tx.labReport.upsert({
                where: { labRequestId },
                update: { resultData, reportUrl, remarks, technicianId },
                create: { labRequestId, technicianId, resultData, reportUrl, remarks }
            });

            await tx.labRequest.update({
                where: { id: labRequestId },
                data: { status: 'COMPLETED' }
            });

            await tx.appointment.update({
                where: { id: labReq.appointmentId },
                data: { status: 'LAB_COMPLETED' }
            });

            return report;
        });
    }

    // 6. Doctor: Generate Prescription
    async createPrescription(appointmentId, doctorUserId, notes, items) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true }
        });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const prescription = await tx.prescription.upsert({
                where: { appointmentId },
                update: { notes },
                create: {
                    appointmentId,
                    patientId: appointment.patientId,
                    doctorId: appointment.doctor.id,
                    notes
                }
            });

            // Delete old items if updating
            await tx.prescriptionItem.deleteMany({ where: { prescriptionId: prescription.id } });

            if (items && items.length > 0) {
                await tx.prescriptionItem.createMany({
                    data: items.map(item => ({
                        prescriptionId: prescription.id,
                        medicineId: item.medicineId || null,
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        durationDays: parseInt(item.durationDays) || 1,
                        quantity: parseInt(item.quantity) || 1
                    }))
                });
            }

            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'PRESCRIPTION_GENERATED' }
            });

            return prescription;
        });
    }

    // 7. Pharmacy: Dispense Medicine & Deduct Inventory Stock
    async dispenseMedicine(prescriptionId) {
        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: { items: true, appointment: true }
        });
        if (!prescription) throw new AppError('Prescription not found', 404);
        if (prescription.dispensed) throw new AppError('Prescription already dispensed', 400);

        return await prisma.$transaction(async (tx) => {
            // Deduct medicine stock for linked medicines
            for (const item of prescription.items) {
                if (item.medicineId) {
                    const stocks = await tx.medicineStock.findMany({
                        where: { medicineId: item.medicineId, quantity: { gt: 0 } },
                        orderBy: { expiryDate: 'asc' }
                    });

                    let remainingToDeduct = item.quantity;
                    for (const stock of stocks) {
                        if (remainingToDeduct <= 0) break;
                        const deduct = Math.min(stock.quantity, remainingToDeduct);
                        await tx.medicineStock.update({
                            where: { id: stock.id },
                            data: { quantity: stock.quantity - deduct }
                        });
                        remainingToDeduct -= deduct;
                    }
                }
            }

            await tx.prescription.update({
                where: { id: prescriptionId },
                data: { dispensed: true }
            });

            await tx.appointment.update({
                where: { id: prescription.appointmentId },
                data: { status: 'MEDICINE_DISPENSED' }
            });

            return { success: true, message: 'Medicines dispensed and inventory updated.' };
        });
    }

    // 8. Accounts: Generate Invoice & Process Payment
    async processPayment(appointmentId, amount, paymentMethod, referenceNo) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.upsert({
                where: { appointmentId },
                update: { paymentStatus: 'PAID' },
                create: {
                    appointmentId,
                    patientId: appointment.patientId,
                    subTotal: appointment.totalFee,
                    totalAmount: appointment.totalFee,
                    paymentStatus: 'PAID'
                }
            });

            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: parseFloat(amount) || appointment.totalFee,
                    paymentMethod: paymentMethod || 'CASH',
                    referenceNo
                }
            });

            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: 'TREATMENT_COMPLETED' }
            });

            return { invoice, payment };
        });
    }
}

module.exports = new WorkflowService();
