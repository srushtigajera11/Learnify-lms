const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Course = require('../models/courseModel');
const User = require('../models/User');


exports.getEnrollmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;


    const enrollments = await Enrollment.find({ studentId: userId })
      .populate({
        path: 'courseId',
        select: 'title thumbnail createdBy',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    const formatted = await Promise.all(enrollments.map(async (enroll) => {
      const totalLessons = enroll.courseId?.lessons?.length || 1; // fallback to 1 to avoid 0 division
      const completed = enroll.progress.length;
      const percentage = Math.round((completed / totalLessons) * 100);

      return {
        _id: enroll._id,
        course: {
          _id: enroll.courseId._id,
          title: enroll.courseId.title,
          thumbnail: enroll.courseId.thumbnail,
          createdBy: {
            Name: enroll.courseId.createdBy?.name || 'Unknown'
          }
        },
        createdAt: enroll.createdAt,
        progress: percentage,
        status: 'In Progress'
      };
    }));

    res.status(200).json({ success: true, enrollments: formatted });
  } catch (error) {
    console.error('Enrollment History Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 📌 GET /api/history/payments

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .populate("courseId", "title thumbnail")
      .sort({ createdAt: -1 });

    const formatted = payments.map((pay) => ({
      _id: pay._id,
      course: pay.courseId
        ? {
            _id: pay.courseId._id,
            title: pay.courseId.title,
            thumbnail: pay.courseId.thumbnail,
          }
        : {
            _id: null,
            title: "Course No Longer Available",
            thumbnail: null,
          },
      amount: pay.amount,
      status: pay.status,
      createdAt: pay.createdAt,
      razorpayPaymentId: pay.razorpayPaymentId,
      razorpayOrderId: pay.razorpayOrderId,
    }));

    return res.status(200).json({
      success: true,
      payments: formatted,
    });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching payments",
    });
  }
};