const pool = require('../config/db');

const bookAppointment = async (req, res) => {
    const { slot_id } = req.body;
    const patient_id = req.user.id; // From JWT token

    // Only USERS can book appointments
    if (req.user.role !== 'USER') {
        return res.status(403).json({ status: 'error', message: 'Only patients (Users) can book appointments' });
    }

    if (!slot_id) {
        return res.status(400).json({ status: 'error', message: 'Slot ID is required' });
    }

    const client = await pool.connect(); // Use a single client for Transaction

    try {
        await client.query('BEGIN'); // 🚀 START TRANSACTION
        // 1. Check if slot exists and Lock the Row (SELECT FOR UPDATE)
        // Idhu dhaan Double Booking-a thadukkum!
        const slotQuery = `
            SELECT da.id, da.is_booked, dp.id AS doctor_id, dp.consultation_fee 
            FROM doctor_availability da
            JOIN doctor_profiles dp ON da.doctor_id = dp.id
            WHERE da.id = $1 FOR UPDATE
        `;
        const slotRes = await client.query(slotQuery, [slot_id]);

        if (slotRes.rows.length === 0) {
            throw new Error('Slot not found');
        }

        const slot = slotRes.rows[0];

        if (slot.is_booked) {
            throw new Error('Sorry, this slot is already booked by someone else');
        }

        // 2. Calculate Fees
        const settingsRes = await client.query(`SELECT commission_percentage FROM admin_settings LIMIT 1`);
        const commissionPct = parseFloat(settingsRes.rows[0].commission_percentage);
        const doctorFee = parseFloat(slot.consultation_fee);

        const adminCommission = (doctorFee * commissionPct) / 100;
        const totalFee = doctorFee + adminCommission;

        // 3. Create Appointment Record
        const insertApptQuery = `
            INSERT INTO appointments (patient_id, doctor_id, slot_id, doctor_fee, admin_commission, total_fee)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, status, total_fee
        `;
        const apptRes = await client.query(insertApptQuery, [
            patient_id, slot.doctor_id, slot_id, doctorFee, adminCommission, totalFee
        ]);

        // 4. Update Slot status to Booked
        await client.query(`UPDATE doctor_availability SET is_booked = TRUE WHERE id = $1`, [slot_id]);

        await client.query('COMMIT'); // ✅ SAVE EVERYTHING

        res.status(201).json({
            status: 'success',
            message: 'Appointment booked successfully',
            data: apptRes.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK'); // ❌ UNDO EVERYTHING IF ERROR OCCURS
        console.error('Booking Error:', error.message);
        res.status(400).json({ status: 'error', message: error.message });
    } finally {
        client.release(); // Return client back to the pool
    }
};
// Get all appointments booked by the logged-in User (Patient)
const getUserAppointments = async (req, res) => {
    try {
        const patientId = req.user.id; // From JWT token

        const query = `
            SELECT a.id AS appointment_id, a.total_fee, a.status, a.created_at,
                   d_user.name AS doctor_name, dp.specialization,
                   da.slot_date, da.start_time, da.end_time
            FROM appointments a
            JOIN doctor_profiles dp ON a.doctor_id = dp.id
            JOIN users d_user ON dp.user_id = d_user.id
            JOIN doctor_availability da ON a.slot_id = da.id
            WHERE a.patient_id = $1
            ORDER BY da.slot_date DESC, da.start_time DESC;
        `;
        const { rows } = await pool.query(query, [patientId]);

        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Get User Appointments Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get prescription details for a specific appointment
const getPrescription = async (req, res) => {
    const { appointmentId } = req.params;

    try {
        const query = `
            SELECT medication_details, notes, created_at 
            FROM prescriptions 
            WHERE appointment_id = $1
        `;
        const { rows } = await pool.query(query, [appointmentId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Prescription not found yet.' });
        }

        res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error('Get Prescription Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Cancel Appointment API
const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get Appointment and Slot Date/Time
        const apptQuery = `
            SELECT a.status, da.slot_date, da.start_time, a.slot_id 
            FROM appointments a
            JOIN doctor_availability da ON a.slot_id = da.id
            WHERE a.id = $1 FOR UPDATE
        `;
        const { rows } = await client.query(apptQuery, [appointmentId]);

        if (rows.length === 0) throw new Error("Appointment not found");

        const appointment = rows[0];

        if (appointment.status !== 'BOOKED') {
            throw new Error(`Cannot cancel a ${appointment.status} appointment`);
        }

        // 2. 24-Hour Rule Check
        const slotDateTime = new Date(`${appointment.slot_date.toISOString().split('T')[0]}T${appointment.start_time}`);
        const currentDateTime = new Date();
        const diffInHours = (slotDateTime - currentDateTime) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            throw new Error("Appointments cannot be cancelled within 24 hours of the scheduled time.");
        }

        // 3. Update Status to CANCELLED and free the slot
        await client.query(`UPDATE appointments SET status = 'CANCELLED' WHERE id = $1`, [appointmentId]);
        await client.query(`UPDATE doctor_availability SET is_booked = FALSE WHERE id = $1`, [appointment.slot_id]);

        await client.query('COMMIT');
        res.status(200).json({ status: 'success', message: 'Appointment cancelled successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ status: 'error', message: error.message });
    } finally {
        client.release();
    }
};

module.exports = { bookAppointment, getUserAppointments, getPrescription, cancelAppointment };