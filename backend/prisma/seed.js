const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Hospital Management ERP Seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Departments
  console.log('🏢 Creating Departments...');
  const cardo = await prisma.department.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: { name: 'Cardiology', description: 'Heart and cardiovascular system care' }
  });

  const neuro = await prisma.department.upsert({
    where: { name: 'Neurology' },
    update: {},
    create: { name: 'Neurology', description: 'Brain, spine and nervous system' }
  });

  const peds = await prisma.department.upsert({
    where: { name: 'Pediatrics' },
    update: {},
    create: { name: 'Pediatrics', description: 'Child healthcare and development' }
  });

  const genMed = await prisma.department.upsert({
    where: { name: 'General Medicine' },
    update: {},
    create: { name: 'General Medicine', description: 'Comprehensive primary healthcare' }
  });

  // Helper for user creation
  async function createAccount(email, name, role) {
    return await prisma.user.upsert({
      where: { email },
      update: { name, password: passwordHash, role },
      create: {
        email,
        name,
        password: passwordHash,
        role,
        isVerified: true
      }
    });
  }

  console.log('🔑 Creating 8 Role Accounts (Password: password123)...');
  const superAdmin = await createAccount('superadmin@hospital.com', 'Super Admin', 'SUPER_ADMIN');
  const receptionist = await createAccount('receptionist@hospital.com', 'Sarah Jenkins (Receptionist)', 'RECEPTIONIST');
  const doctorUser = await createAccount('doctor@hospital.com', 'Dr. John Smith', 'DOCTOR');
  const patientUser = await createAccount('patient@hospital.com', 'Jane Doe (Patient)', 'PATIENT');
  const labTech = await createAccount('labtech@hospital.com', 'Michael Chang (Lab Tech)', 'LAB_TECHNICIAN');
  const pharmacyUser = await createAccount('pharmacy@hospital.com', 'Robert Taylor (Pharmacist)', 'PHARMACY');
  const accountsUser = await createAccount('accounts@hospital.com', 'David Miller (Accountant)', 'ACCOUNTS');
  const nurseUser = await createAccount('nurse@hospital.com', 'Nurse Emily Davis', 'NURSE');

  // Create Profiles
  console.log('👨‍⚕️ Creating Doctor & Patient Profiles...');
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      departmentId: cardo.id,
      specialization: 'Cardiologist',
      experienceYears: 10,
      consultationFee: 500.0,
      hospitalAddress: 'Lumina Heart Center, Tower A',
      isApproved: true,
      availability: {
        monday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        tuesday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
        wednesday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
        thursday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
        friday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM']
      }
    }
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      patientCode: 'PAT-2026-0001',
      userId: patientUser.id,
      dob: new Date('1992-05-15'),
      age: 34,
      gender: 'Female',
      bloodGroup: 'O+',
      address: '742 Evergreen Terrace, Medical City',
      city: 'Medical City',
      state: 'Tamil Nadu',
      emergencyContact: '+91 9876543210'
    }
  });

  // Seed Medicines & Stock
  console.log('💊 Seeding Medicines & Inventory...');
  const para = await prisma.medicine.upsert({
    where: { name: 'Paracetamol 500mg' },
    update: {},
    create: { name: 'Paracetamol 500mg', category: 'Analgesics', unitPrice: 5.0, reorderLevel: 50 }
  });

  const amox = await prisma.medicine.upsert({
    where: { name: 'Amoxicillin 500mg' },
    update: {},
    create: { name: 'Amoxicillin 500mg', category: 'Antibiotics', unitPrice: 15.0, reorderLevel: 20 }
  });

  await prisma.medicineStock.createMany({
    data: [
      { medicineId: para.id, batchNumber: 'BATCH-2026-A', quantity: 500, expiryDate: new Date('2028-12-31') },
      { medicineId: amox.id, batchNumber: 'BATCH-2026-B', quantity: 200, expiryDate: new Date('2027-06-30') }
    ],
    skipDuplicates: true
  });

  // Create initial Appointment for Workflow demo
  console.log('📅 Creating Sample Workflow Appointment...');
  const today = new Date();
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: cardo.id,
      date: today,
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      status: 'SCHEDULED',
      reason: 'Routine Cardiology Follow-up & Mild Chest Discomfort',
      doctorFee: 500.0,
      adminCommission: 50.0,
      totalFee: 550.0
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n====================================================');
  console.log('🏥 HOSPITAL ERP ROLE ACCOUNTS (Password: password123)');
  console.log('----------------------------------------------------');
  console.log('1. SUPER_ADMIN   : superadmin@hospital.com');
  console.log('2. RECEPTIONIST  : receptionist@hospital.com');
  console.log('3. DOCTOR        : doctor@hospital.com');
  console.log('4. PATIENT       : patient@hospital.com');
  console.log('5. LAB_TECHNICIAN: labtech@hospital.com');
  console.log('6. PHARMACY      : pharmacy@hospital.com');
  console.log('7. ACCOUNTS      : accounts@hospital.com');
  console.log('8. NURSE         : nurse@hospital.com');
  console.log('====================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
