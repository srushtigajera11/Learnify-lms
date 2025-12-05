const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, default: "completed" },  // optional
  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Payment', paymentSchema);