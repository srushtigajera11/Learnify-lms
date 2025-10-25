const instance = require('../utils/razorpayInstance');
const crypto = require('crypto');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100,  // Convert to paise
            currency: 'INR',  // Assuming INR, change if needed
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        console.log("Order created:", order);
        res.status(200).json({ success: true, order});
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getKey  = async (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
}

exports.verifyAndEnroll = async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency = 'INR'
    } = req.body;

    // 1. Verify payment
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Payment.create({
        userId: studentId,  // ✅ fixed here
        courseId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount,
        currency,
        status: 'failed'
      });

      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 2. Check course
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Course not found or unpublished' });
    }

    // 3. Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ courseId, studentId });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // 4. Save successful payment
    await Payment.create({
      userId: studentId,  // ✅ fixed here too
      courseId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount,
      currency,
      status: 'success'
    });

    // 5. Enroll
    const enrollment = await Enrollment.create({ courseId, studentId });
    console.log("RAZORPAY_KEY_SECRET from env:", process.env.RAZORPAY_KEY_SECRET);

    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
