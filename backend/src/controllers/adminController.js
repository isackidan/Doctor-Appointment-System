const pool = require('../config/db');

const approveDoctor = async (req, res) => {
    const { doctorId } = req.params; // Expecting user_id of the doctor

    try {
        const updateQuery = `
            UPDATE doctor_profiles 
            SET is_approved = TRUE 
            WHERE user_id = $1 RETURNING *;
        `;
        const { rows } = await pool.query(updateQuery, [doctorId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Doctor profile not found' });
        }

        res.status(200).json({ status: 'success', message: 'Doctor approved successfully', data: rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Fetch doctors who are waiting for approval
const getPendingDoctors = async (req, res) => {
    try {
        const query = `
            SELECT u.id AS user_id, u.name, u.email, 
                   dp.specialization, dp.certificate_url, dp.is_approved, dp.hospital_address
            FROM users u
            JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'DOCTOR' AND dp.is_approved = FALSE;
        `;
        const { rows } = await pool.query(query);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get Pending Doctors Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Fetch all doctors (both approved and pending)
const getAllDoctors = async (req, res) => {
    try {
        const query = `
            SELECT u.id AS user_id, u.name, u.email, 
                   dp.specialization, dp.certificate_url, dp.is_approved, dp.hospital_address
            FROM users u
            JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'DOCTOR'
            ORDER BY dp.is_approved ASC, u.name ASC;
        `;
        const { rows } = await pool.query(query);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get All Doctors Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get all appointments across the platform for Admin
const getAllAppointments = async (req, res) => {
    try {
        // Joining 4 tables to get a complete view!
        const query = `
            SELECT a.id AS appointment_id, a.status, a.total_fee, a.created_at,
                   p.name AS patient_name, p.email AS patient_email,
                   d_user.name AS doctor_name,
                   da.slot_date, da.start_time, da.end_time
            FROM appointments a
            JOIN users p ON a.patient_id = p.id
            JOIN doctor_profiles dp ON a.doctor_id = dp.id
            JOIN users d_user ON dp.user_id = d_user.id
            JOIN doctor_availability da ON a.slot_id = da.id
            ORDER BY a.created_at DESC;
        `;
        const { rows } = await pool.query(query);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get All Appointments Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get Dashboard Statistics for Admin
const getDashboardStats = async (req, res) => {
    try {
        // Run multiple count & sum queries concurrently for better performance
        const [patientsRes, doctorsRes, appointmentsRes, earningsRes] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users WHERE role = 'USER'"),
            pool.query("SELECT COUNT(*) FROM users WHERE role = 'DOCTOR'"),
            pool.query("SELECT COUNT(*) FROM appointments"),
            pool.query("SELECT SUM(admin_commission) AS total_commission FROM appointments WHERE status = 'COMPLETED'")
        ]);

        const stats = {
            total_patients: parseInt(patientsRes.rows[0].count),
            total_doctors: parseInt(doctorsRes.rows[0].count),
            total_appointments: parseInt(appointmentsRes.rows[0].count),
            total_earnings: parseFloat(earningsRes.rows[0].total_commission || 0).toFixed(2)
        };

        res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
        console.error('Get Stats Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Update the exports
module.exports = { approveDoctor, getPendingDoctors, getAllDoctors, getAllAppointments, getDashboardStats };