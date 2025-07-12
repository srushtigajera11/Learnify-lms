const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const paymentController = require('../controller/paymentController');


router.post('/create-order', paymentController.createOrder);
router.get('/get-key', paymentController.getKey);

module.exports = router;