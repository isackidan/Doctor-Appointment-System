// src/routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// POST API for Registration
router.post('/register', upload.single('certificate'), register);
router.post('/login', login);

module.exports = router;
