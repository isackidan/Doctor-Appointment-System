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

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const startCronJobs = require('./utils/cronJobs');

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Allow requests from React frontend (Can be configured with specific origin)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Development logging
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per IP
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
            message: 'Server and Database are running perfectly!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// 2. ROUTES
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/doctor', doctorRoutes); 
app.use('/api/appointments', appointmentRoutes); 

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

// Start Cron Jobs (if cronJobs file is properly handling Prisma now)
if (typeof startCronJobs === 'function') {
  try {
    startCronJobs(); 
  } catch (e) {
    console.error("Failed to start cron jobs: ", e.message);
  }
}

// 4. SERVER START (Handled by server.js or here if running node src/app.js)
// If you use server.js, module.exports = app; is better.
// But based on existing package.json `start: node src/app.js`, we listen here:
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;