const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET /api/user/profile
const getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                   dp.specialization, dp.consultation_fee, dp.hospital_address, dp.is_approved
            FROM users u
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.id = $1
        `;
        const { rows } = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User profile not found' });
        }

        res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error('Get Profile Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error fetching profile' });
    }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, phone, specialization, consultation_fee, hospital_address } = req.body;

    if (!name) {
        return res.status(400).json({ status: 'error', message: 'Name is required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update core users table
        await client.query(
            'UPDATE users SET name = $1, phone = $2 WHERE id = $3',
            [name, phone || null, userId]
        );

        // 2. If Doctor, update doctor_profiles
        if (req.user.role === 'DOCTOR') {
            await client.query(`
                UPDATE doctor_profiles 
                SET specialization = COALESCE($1, specialization),
                    consultation_fee = COALESCE($2, consultation_fee),
                    hospital_address = COALESCE($3, hospital_address)
                WHERE user_id = $4
            `, [specialization, consultation_fee ? parseFloat(consultation_fee) : null, hospital_address, userId]);
        }

        await client.query('COMMIT');

        // Fetch updated user object
        const updatedRes = await client.query(`
            SELECT u.id, u.name, u.email, u.role, u.phone,
                   dp.specialization, dp.consultation_fee, dp.hospital_address
            FROM users u
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.id = $1
        `, [userId]);

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: updatedRes.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update Profile Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error updating profile' });
    } finally {
        client.release();
    }
};

// PUT /api/user/change-password
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ status: 'error', message: 'New password must be at least 6 characters long' });
    }

    try {
        // Fetch current password hash
        const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Incorrect current password' });
        }

        // Hash new password & update
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

        res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change Password Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error changing password' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
