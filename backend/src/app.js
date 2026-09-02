const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const prisma = require('./config/prisma');

// Import routes for all 8 Hospital ERP roles
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const labRoutes = require('./routes/labRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const accountsRoutes = require('./routes/accountsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Allow requests from React frontend

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Development logging
}

// Limit requests from same API
const limiter = rateLimit({
  max: 200, // 200 requests per IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check & DB Test Route
app.get('/api/health', async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ 
            status: 'success', 
            message: 'Hospital ERP Server & Prisma Database are running perfectly!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// 2. MOUNT ROLE & WORKFLOW ROUTES
app.use('/api/auth', authRoutes); 
app.use('/api/workflow', workflowRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medicines', medicineRoutes); 
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/user', userRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/reviews', reviewRoutes); 

// Handling unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

// 4. SERVER START
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
      console.log(`🚀 Hospital ERP Server is running on port ${PORT}`);
  });
}

module.exports = app;