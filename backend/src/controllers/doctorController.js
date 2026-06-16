const pool = require('../config/db');

const addAvailabilitySlot = async (req, res) => {
    const { slot_date, start_time, end_time } = req.body;
    const userId = req.user.id; // Middlewware-la irundhu varum (from JWT Token)

    if (!slot_date || !start_time || !end_time) {
        return res.status(400).json({ status: 'error', message: 'Missing date or time fields' });
    }

    try {
        // 1. Get the real doctor_profile ID using the logged-in User ID
        const docQuery = await pool.query('SELECT id FROM doctor_profiles WHERE user_id = $1', [userId]);

        if (docQuery.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Doctor profile not found' });
        }

        const doctorId = docQuery.rows[0].id;

        // 2. Insert the slot into availability table
        const insertQuery = `
            INSERT INTO doctor_availability (doctor_id, slot_date, start_time, end_time)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const { rows } = await pool.query(insertQuery, [doctorId, slot_date, start_time, end_time]);

        res.status(201).json({ status: 'success', message: 'Slot created successfully', data: rows[0] });

    } catch (error) {
        // 23505 is PostgreSQL's error code for UNIQUE constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ status: 'error', message: 'Slot already exists for this time' });
        }
        console.error('Slot Creation Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
// Get all APPROVED doctors (For Users to see in UI)
const getApprovedDoctors = async (req, res) => {
    try {
        const query = `
            SELECT u.id AS user_id, dp.id AS doctor_profile_id, u.name, u.email, 
                   dp.specialization, dp.consultation_fee, dp.certificate_url, dp.hospital_address
            FROM users u
            JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'DOCTOR' AND dp.is_approved = TRUE;
        `;
        const { rows } = await pool.query(query);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get Doctors Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get available slots for a specific doctor
const getDoctorSlots = async (req, res) => {
    const { doctorProfileId } = req.params; // Get ID from URL

    try {
        // Change this query inside getDoctorSlots
        const query = `
            SELECT id AS slot_id, slot_date, start_time, end_time 
            FROM doctor_availability 
            WHERE doctor_id = $1 
            AND is_booked = FALSE 
            -- Pudhu condition: Date future-a irukkanum, illana Date innaiki irundha Time future-a irukkanum
            AND (slot_date > CURRENT_DATE OR (slot_date = CURRENT_DATE AND start_time > CURRENT_TIME))
            ORDER BY slot_date, start_time;
        `;
        const { rows } = await pool.query(query, [doctorProfileId]);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get Slots Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get appointments specifically booked for the logged-in doctor
const getMyBookedAppointments = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT token

        // 1. Get the real doctor_profile ID
        const docQuery = await pool.query('SELECT id FROM doctor_profiles WHERE user_id = $1', [userId]);
        if (docQuery.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Doctor profile not found' });
        }
        const doctorId = docQuery.rows[0].id;

        // 2. Fetch appointments linked to this doctor
        const query = `
            SELECT a.id AS appointment_id, a.status, a.created_at,
                   u.name AS patient_name, u.email AS patient_email,
                   da.slot_date, da.start_time, da.end_time
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            JOIN doctor_availability da ON a.slot_id = da.id
            WHERE a.doctor_id = $1
            ORDER BY da.slot_date, da.start_time;
        `;
        const { rows } = await pool.query(query, [doctorId]);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get Doctor Appointments Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Add prescription and mark appointment as COMPLETED
const addPrescription = async (req, res) => {
    const { appointmentId } = req.params;
    const { medication_details, notes } = req.body;

    if (!medication_details) {
        return res.status(400).json({ status: 'error', message: 'Medication details are required' });
    }

    const client = await pool.connect(); // Transaction starts

    try {
        await client.query('BEGIN');

        // 1. Insert Prescription
        const insertQuery = `
            INSERT INTO prescriptions (appointment_id, medication_details, notes) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        await client.query(insertQuery, [appointmentId, medication_details, notes]);

        // 2. Update Appointment Status to COMPLETED
        await client.query(`UPDATE appointments SET status = 'COMPLETED' WHERE id = $1`, [appointmentId]);

        await client.query('COMMIT'); // Save changes

        res.status(201).json({ status: 'success', message: 'Prescription added and appointment marked as COMPLETED.' });
    } catch (error) {
        await client.query('ROLLBACK'); // Undo on error
        console.error('Prescription Error:', error.message);
        // 23505 is PostgreSQL unique violation (If prescription already exists)
        if (error.code === '23505') {
            return res.status(400).json({ status: 'error', message: 'Prescription already exists for this appointment' });
        }
        res.status(500).json({ status: 'error', message: 'Server error' });
    } finally {
        client.release();
    }
};

// Update exports at the bottom
module.exports = {
    addAvailabilitySlot, getApprovedDoctors, getDoctorSlots,
    getMyBookedAppointments, addPrescription // <-- Add this
};