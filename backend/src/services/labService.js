const prisma = require('../config/prisma');

// Get Lab Dashboard Stats
const getDashboardStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, collected, inProgress, completed, urgent] = await Promise.all([
        prisma.labRequest.count({ where: { status: 'PENDING' } }),
        prisma.labRequest.count({ where: { status: 'SAMPLE_COLLECTED' } }),
        prisma.labRequest.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.labRequest.count({ where: { status: 'COMPLETED', updatedAt: { gte: today } } }),
        prisma.labRequest.count({ where: { priority: 'URGENT', status: { not: 'COMPLETED' } } })
    ]);

    return { pending, collected, inProgress, completed, urgent };
};

// Get Lab Orders
const getLabOrders = async (statusFilter) => {
    const whereClause = statusFilter ? { status: statusFilter } : {};
    
    return await prisma.labRequest.findMany({
        where: whereClause,
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
            appointment: true,
            labReport: true
        },
        orderBy: [
            { priority: 'desc' }, // URGENT first
            { createdAt: 'desc' }
        ]
    });
};

// Record Sample Collection
const collectSample = async (id, sampleData) => {
    const { sampleType, collectionDate, sampleNotes } = sampleData;

    return await prisma.labRequest.update({
        where: { id },
        data: {
            status: 'SAMPLE_COLLECTED',
            sampleType,
            collectionDate: new Date(collectionDate),
            sampleNotes
        },
        include: { patient: { include: { user: true } } }
    });
};

// Process Test
const processTest = async (id) => {
    return await prisma.labRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
        include: { patient: { include: { user: true } } }
    });
};

// Submit Result
const submitResult = async (id, resultData, technicianId) => {
    const { resultText, remarks } = resultData;

    // Transaction to update request and create report
    const [request, report] = await prisma.$transaction([
        prisma.labRequest.update({
            where: { id },
            data: { status: 'COMPLETED' }
        }),
        prisma.labReport.create({
            data: {
                labRequestId: id,
                resultData: resultText,
                remarks,
                technicianId
            }
        })
    ]);

    // Update appointment status if not already completed
    if (request.appointmentId) {
        await prisma.appointment.update({
            where: { id: request.appointmentId },
            data: { status: 'LAB_COMPLETED' }
        }).catch(() => {}); // ignore error if appointment is missing
    }

    return { request, report };
};

// Search Patients and History
const searchPatients = async (query) => {
    return await prisma.patient.findMany({
        where: {
            OR: [
                { patientCode: { contains: query, mode: 'insensitive' } },
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { user: { phone: { contains: query, mode: 'insensitive' } } }
            ]
        },
        include: {
            user: true,
            labRequests: {
                include: { labReport: true },
                orderBy: { createdAt: 'desc' }
            }
        },
        take: 10
    });
};

module.exports = {
    getDashboardStats,
    getLabOrders,
    collectSample,
    processTest,
    submitResult,
    searchPatients
};
