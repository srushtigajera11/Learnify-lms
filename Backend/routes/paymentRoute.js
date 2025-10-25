const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const paymentController = require('../controller/paymentController');

 // assuming you have this utility function


router.post('/create-order', isAuthenticated, authorizeRoles('student'),paymentController.createOrder);
router.get('/get-key', isAuthenticated, authorizeRoles('student'), paymentController.getKey);
router.post('/verify-enroll', isAuthenticated, authorizeRoles('student'), paymentController.verifyAndEnroll);

module.exports = router;