const express = require('express');
const { addReview, getDoctorReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, addReview);
router.get('/doctor/:doctorProfileId', getDoctorReviews);

module.exports = router;
