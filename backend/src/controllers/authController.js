// src/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role, specialization, consultation_fee, certificate_url, hospital_address } = req.body;

    // Basic Validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const client = await pool.connect(); // Get a DB client for transaction

    try {
        await client.query('BEGIN'); // 🚀 Start Transaction

        // 1. Check if user already exists
        const userExists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            throw new Error('User with this email already exists');
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert into core users table
        const userInsertQuery = `
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, role
        `;
        const userResult = await client.query(userInsertQuery, [name, email, passwordHash, role]);
        const newUser = userResult.rows[0];

        // 4. If role is DOCTOR, insert into doctor_profiles
        if (role === 'DOCTOR') {
            if (!specialization || !consultation_fee || !hospital_address) {
                throw new Error('Doctor requires specialization, consultation_fee, and hospital_address');
            }
            const docInsertQuery = `
                INSERT INTO doctor_profiles (user_id, specialization, consultation_fee, certificate_url, hospital_address) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(docInsertQuery, [newUser.id, specialization, consultation_fee, certificate_url, hospital_address]);
        }

        await client.query('COMMIT'); // ✅ Save all changes

        res.status(201).json({
            status: 'success',
            message: `${role} registered successfully. ${role === 'DOCTOR' ? 'Waiting for Admin approval.' : ''}`,
            data: newUser
        });

    } catch (error) {
        await client.query('ROLLBACK'); // ❌ Undo everything if any query fails
        console.error('Registration Error:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    } finally {
        client.release(); // Release the DB client back to the pool
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    try {
        // 1. Fetch user & doctor approval status (LEFT JOIN works for both Users & Doctors)
        const userQuery = `
            SELECT u.id, u.name, u.email, u.password_hash, u.role, dp.is_approved 
            FROM users u
            LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.email = $1
        `;
        const { rows } = await pool.query(userQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const user = rows[0];

        // 2. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        // 3. Check Doctor Approval Status (Edge Case)
        if (user.role === 'DOCTOR' && user.is_approved === false) {
            return res.status(403).json({
                status: 'error',
                message: 'Your account is pending Admin approval.'
            });
        }

        // 4. Generate JWT Token
        // Payload contains id and role. Secret key is from .env
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error during login' });
    }
};
module.exports = { register,login };
