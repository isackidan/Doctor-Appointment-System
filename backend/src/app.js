// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db'); // Import DB connection
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const startCronJobs = require('./utils/cronJobs');

const app = express();

// Middlewares
app.use(express.json()); // Parse incoming JSON payloads
app.use(cors()); // Allow requests from React frontend
app.use(helmet()); // Secure HTTP headers
app.use(morgan('dev')); // Log API requests in terminal

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check & DB Test Route
app.get('/api/health', async (req, res) => {
    try {
        const dbRes = await pool.query('SELECT NOW()');
        res.status(200).json({ 
            status: 'success', 
            message: 'Server and Database are running perfectly!',
            db_time: dbRes.rows[0].now 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// 1. Mount All API Routes HERE
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/doctor', doctorRoutes); 
app.use('/api/appointments', appointmentRoutes); 

// 2. Start Cron Jobs HERE
startCronJobs(); 

// 3. Start Server HERE (Only ONCE at the very end)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});