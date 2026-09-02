const pool = require('./src/config/db');
const bcrypt = require('bcrypt');

async function resetAndSeed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('🧹 Clearing all existing database tables...');
        await client.query('DELETE FROM prescriptions');
        await client.query('DELETE FROM appointments');
        await client.query('DELETE FROM doctor_availability');
        await client.query('DELETE FROM doctor_profiles');
        await client.query('DELETE FROM users');
        await client.query('DELETE FROM admin_settings');

        // Reset admin settings
        await client.query('INSERT INTO admin_settings (commission_percentage) VALUES (10.00)');

        console.log('🔑 Hashing default passwords...');
        const commonPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(commonPassword, salt);

        console.log('👤 Creating Admin Account...');
        const adminRes = await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4) RETURNING id, email, role;
        `, ['System Admin', 'admin@doctor.com', hashedPassword, 'ADMIN']);

        console.log('👨‍⚕️ Creating Approved Doctor Account...');
        const docUserRes = await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4) RETURNING id, email, role;
        `, ['Dr. John Smith', 'doctor@doctor.com', hashedPassword, 'DOCTOR']);

        const docUserId = docUserRes.rows[0].id;

        await client.query(`
            INSERT INTO doctor_profiles (user_id, specialization, consultation_fee, certificate_url, hospital_address, is_approved)
            VALUES ($1, $2, $3, $4, $5, $6);
        `, [
            docUserId, 
            'Cardiologist', 
            500.00, 
            '/uploads/sample_cert.pdf', 
            'City Heart Care Hospital, Main Street', 
            true
        ]);

        console.log('🏥 Creating Patient (User) Account...');
        await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4) RETURNING id, email, role;
        `, ['Jane Doe', 'patient@doctor.com', hashedPassword, 'USER']);

        await client.query('COMMIT');
        console.log('\n✅ Database reset and seeded successfully!');
        console.log('====================================================');
        console.log('🔐 ALL ACCOUNTS CREATED WITH PASSWORD: password123');
        console.log('----------------------------------------------------');
        console.log('1️⃣ ADMIN ACCOUNT:');
        console.log('   Email: admin@doctor.com');
        console.log('   Password: password123');
        console.log('----------------------------------------------------');
        console.log('2️⃣ DOCTOR ACCOUNT (Approved):');
        console.log('   Email: doctor@doctor.com');
        console.log('   Password: password123');
        console.log('----------------------------------------------------');
        console.log('3️⃣ PATIENT (USER) ACCOUNT:');
        console.log('   Email: patient@doctor.com');
        console.log('   Password: password123');
        console.log('====================================================\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error resetting database:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

resetAndSeed();
