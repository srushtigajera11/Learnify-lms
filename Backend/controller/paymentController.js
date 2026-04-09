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

    // verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {

      await Payment.create({
        userId: studentId,
        courseId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount,
        currency,
        status: "failed"
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    const course = await Course.findById(courseId);

    const invoiceNumber = "INV-" + Date.now();

    const payment = await Payment.create({

      userId: studentId,
      courseId,

      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,

      amount,
      currency,
      status: "success",

      invoiceNumber
    });

    const enrollment = await Enrollment.create({
      courseId,
      studentId
    });

    res.status(201).json({

      success: true,

      message: "Payment successful",

      enrollment,

      paymentId: payment._id

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }
};

exports.getInvoice = async (req, res) => {

  try {

    const payment = await Payment
      .findById(req.params.id)
      .populate("courseId")
      .populate("userId");

    if (!payment)
      return res.status(404).json({
        message: "Invoice not found"
      });

    res.json({
      success: true,
      payment
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }
};