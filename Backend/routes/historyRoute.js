const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getEnrollmentHistory, getPaymentHistory } = require('../controller/historyController');

router.get('/enrollments', isAuthenticated, getEnrollmentHistory);
router.get('/payments', isAuthenticated, getPaymentHistory);

module.exports = router;
