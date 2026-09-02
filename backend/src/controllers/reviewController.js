const pool = require('../config/db');

// POST /api/reviews - Add review for a completed appointment
const addReview = async (req, res) => {
    const { appointmentId, rating, comment } = req.body;
    const patientUserId = req.user.id;

    if (!appointmentId || !rating) {
        return res.status(400).json({ status: 'error', message: 'Appointment ID and rating (1-5) are required' });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ status: 'error', message: 'Rating must be an integer between 1 and 5' });
    }

    try {
        // 1. Verify appointment belongs to patient and is COMPLETED
        const apptQuery = `
            SELECT a.id, a.doctor_id, a.status, a.patient_id 
            FROM appointments a
            WHERE a.id = $1 AND a.patient_id = $2
        `;
        const apptRes = await pool.query(apptQuery, [appointmentId, patientUserId]);

        if (apptRes.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found or access denied' });
        }

        const appt = apptRes.rows[0];

        if (appt.status !== 'COMPLETED') {
            return res.status(400).json({ status: 'error', message: 'You can only review completed appointments' });
        }

        // 2. Insert Review
        const insertQuery = `
            INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await pool.query(insertQuery, [
            appointmentId, patientUserId, appt.doctor_id, numRating, comment || null
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Thank you for your feedback!',
            data: rows[0]
        });

    } catch (error) {
        // 23505 = unique constraint error (already reviewed)
        if (error.code === '23505') {
            return res.status(400).json({ status: 'error', message: 'You have already reviewed this appointment' });
        }
        console.error('Add Review Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error submitting review' });
    }
};

// GET /api/reviews/doctor/:doctorProfileId - Fetch reviews for a specific doctor
const getDoctorReviews = async (req, res) => {
    const { doctorProfileId } = req.params;

    try {
        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name AS patient_name
            FROM reviews r
            JOIN users u ON r.patient_id = u.id
            WHERE r.doctor_id = $1
            ORDER BY r.created_at DESC;
        `;
        const { rows } = await pool.query(query, [doctorProfileId]);

        // Calculate average rating
        let avgRating = 0;
        if (rows.length > 0) {
            const sum = rows.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = (sum / rows.length).toFixed(1);
        }

        res.status(200).json({
            status: 'success',
            data: {
                reviews: rows,
                average_rating: parseFloat(avgRating),
                total_reviews: rows.length
            }
        });
    } catch (error) {
        console.error('Get Doctor Reviews Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error fetching doctor reviews' });
    }
};

module.exports = {
    addReview,
    getDoctorReviews
};
