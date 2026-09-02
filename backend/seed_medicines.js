// seed_medicines.js - Seeds 50+ common hospital medicines with stock batches
const prisma = require('./src/config/prisma');

const MEDICINES = [
  // Analgesics / Pain Relief
  { name: 'Paracetamol 500mg', category: 'Analgesic', unitPrice: 8.50, reorderLevel: 50 },
  { name: 'Ibuprofen 400mg', category: 'Analgesic', unitPrice: 12.00, reorderLevel: 40 },
  { name: 'Diclofenac Sodium 50mg', category: 'Analgesic', unitPrice: 14.00, reorderLevel: 30 },
  { name: 'Aspirin 75mg', category: 'Analgesic', unitPrice: 6.00, reorderLevel: 50 },
  { name: 'Tramadol 50mg', category: 'Analgesic', unitPrice: 18.00, reorderLevel: 20 },
  { name: 'Mefenamic Acid 500mg', category: 'Analgesic', unitPrice: 10.00, reorderLevel: 30 },

  // Antibiotics
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', unitPrice: 22.00, reorderLevel: 40 },
  { name: 'Azithromycin 500mg', category: 'Antibiotic', unitPrice: 45.00, reorderLevel: 30 },
  { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', unitPrice: 16.00, reorderLevel: 40 },
  { name: 'Doxycycline 100mg', category: 'Antibiotic', unitPrice: 20.00, reorderLevel: 25 },
  { name: 'Metronidazole 400mg', category: 'Antibiotic', unitPrice: 9.00, reorderLevel: 40 },
  { name: 'Clindamycin 300mg', category: 'Antibiotic', unitPrice: 35.00, reorderLevel: 20 },
  { name: 'Cefixime 200mg', category: 'Antibiotic', unitPrice: 55.00, reorderLevel: 25 },

  // Cardiac / BP Medicines
  { name: 'Amlodipine 5mg', category: 'Cardiac', unitPrice: 12.00, reorderLevel: 50 },
  { name: 'Atenolol 50mg', category: 'Cardiac', unitPrice: 10.00, reorderLevel: 50 },
  { name: 'Metoprolol 50mg', category: 'Cardiac', unitPrice: 14.00, reorderLevel: 40 },
  { name: 'Ramipril 5mg', category: 'Cardiac', unitPrice: 18.00, reorderLevel: 40 },
  { name: 'Losartan 50mg', category: 'Cardiac', unitPrice: 22.00, reorderLevel: 35 },
  { name: 'Telmisartan 40mg', category: 'Cardiac', unitPrice: 20.00, reorderLevel: 35 },
  { name: 'Atorvastatin 10mg', category: 'Cardiac', unitPrice: 28.00, reorderLevel: 40 },
  { name: 'Rosuvastatin 10mg', category: 'Cardiac', unitPrice: 35.00, reorderLevel: 30 },

  // Diabetes
  { name: 'Metformin 500mg', category: 'Diabetes', unitPrice: 8.00, reorderLevel: 60 },
  { name: 'Metformin 1000mg', category: 'Diabetes', unitPrice: 14.00, reorderLevel: 40 },
  { name: 'Glibenclamide 5mg', category: 'Diabetes', unitPrice: 6.00, reorderLevel: 40 },
  { name: 'Glimepiride 2mg', category: 'Diabetes', unitPrice: 16.00, reorderLevel: 35 },
  { name: 'Sitagliptin 100mg', category: 'Diabetes', unitPrice: 95.00, reorderLevel: 20 },
  { name: 'Empagliflozin 10mg', category: 'Diabetes', unitPrice: 120.00, reorderLevel: 15 },

  // GI / Gastro
  { name: 'Omeprazole 20mg', category: 'Gastro', unitPrice: 11.00, reorderLevel: 50 },
  { name: 'Pantoprazole 40mg', category: 'Gastro', unitPrice: 14.00, reorderLevel: 50 },
  { name: 'Ranitidine 150mg', category: 'Gastro', unitPrice: 8.00, reorderLevel: 40 },
  { name: 'Ondansetron 4mg', category: 'Gastro', unitPrice: 22.00, reorderLevel: 30 },
  { name: 'Domperidone 10mg', category: 'Gastro', unitPrice: 10.00, reorderLevel: 40 },
  { name: 'Loperamide 2mg', category: 'Gastro', unitPrice: 8.00, reorderLevel: 30 },
  { name: 'Lactulose Syrup 100ml', category: 'Gastro', unitPrice: 65.00, reorderLevel: 15 },

  // Respiratory / Allergy
  { name: 'Cetirizine 10mg', category: 'Respiratory', unitPrice: 6.00, reorderLevel: 60 },
  { name: 'Levocetirizine 5mg', category: 'Respiratory', unitPrice: 8.00, reorderLevel: 50 },
  { name: 'Montelukast 10mg', category: 'Respiratory', unitPrice: 28.00, reorderLevel: 35 },
  { name: 'Salbutamol 100mcg Inhaler', category: 'Respiratory', unitPrice: 120.00, reorderLevel: 10 },
  { name: 'Prednisolone 5mg', category: 'Respiratory', unitPrice: 7.00, reorderLevel: 30 },
  { name: 'Ambroxol 30mg', category: 'Respiratory', unitPrice: 12.00, reorderLevel: 40 },
  { name: 'Levosalbutamol + Ipratropium Respule', category: 'Respiratory', unitPrice: 45.00, reorderLevel: 15 },

  // Vitamins & Supplements
  { name: 'Vitamin D3 60000 IU', category: 'Vitamins', unitPrice: 30.00, reorderLevel: 40 },
  { name: 'Calcium + Vitamin D3 Tablet', category: 'Vitamins', unitPrice: 18.00, reorderLevel: 50 },
  { name: 'B-Complex + Vitamin C', category: 'Vitamins', unitPrice: 15.00, reorderLevel: 50 },
  { name: 'Iron + Folic Acid 100mg', category: 'Vitamins', unitPrice: 10.00, reorderLevel: 60 },
  { name: 'Zinc Sulphate 20mg', category: 'Vitamins', unitPrice: 8.00, reorderLevel: 40 },
  { name: 'Multivitamin Softgel', category: 'Vitamins', unitPrice: 22.00, reorderLevel: 40 },

  // Neuro / Sleep / Anxiety
  { name: 'Alprazolam 0.25mg', category: 'Neurology', unitPrice: 12.00, reorderLevel: 20 },
  { name: 'Clonazepam 0.5mg', category: 'Neurology', unitPrice: 10.00, reorderLevel: 20 },
  { name: 'Gabapentin 300mg', category: 'Neurology', unitPrice: 25.00, reorderLevel: 25 },
  { name: 'Sertraline 50mg', category: 'Neurology', unitPrice: 20.00, reorderLevel: 20 },

  // Dermatology / External
  { name: 'Clotrimazole Cream 20g', category: 'Dermatology', unitPrice: 35.00, reorderLevel: 20 },
  { name: 'Betamethasone Cream 15g', category: 'Dermatology', unitPrice: 28.00, reorderLevel: 20 },
  { name: 'Mupirocin 2% Ointment', category: 'Dermatology', unitPrice: 55.00, reorderLevel: 15 },
];

async function seedMedicines() {
  console.log('🌱 Seeding 50+ Hospital Medicines...\n');
  let added = 0;
  let skipped = 0;

  for (const med of MEDICINES) {
    try {
      const existing = await prisma.medicine.findUnique({ where: { name: med.name } });
      if (existing) {
        skipped++;
        continue;
      }

      const medicine = await prisma.medicine.create({ data: med });

      // Add initial stock batch for each medicine
      await prisma.medicineStock.create({
        data: {
          medicineId: medicine.id,
          batchNumber: `INIT-${medicine.id.slice(0, 6).toUpperCase()}`,
          quantity: 200,
          expiryDate: new Date('2028-12-31')
        }
      });

      added++;
      console.log(`  ✅ Added: ${med.name} (₹${med.unitPrice}) [${med.category}]`);
    } catch (err) {
      console.error(`  ❌ Failed: ${med.name} — ${err.message}`);
    }
  }

  console.log(`\n===========================================`);
  console.log(`✅ Medicines Seeded: ${added} | Skipped (already exist): ${skipped}`);
  console.log(`===========================================\n`);
  await prisma.$disconnect();
}

seedMedicines();
