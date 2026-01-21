// routes/admin.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const Course = require('../models/courseModel');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const adminController = require('../controller/adminController');
const courseController = require("../controller/courseController")

// Get all courses
router.get('/courses', isAuthenticated, isAdmin, async (req, res) => {
  console.log("Authenticated User:", req.user);  // 👈 Debug
  const courses = await Course.find().populate('createdBy', 'name email');
  res.json(courses);
});
// Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      pendingCourses, // Add this line
      totalEnrollments,
      revenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'pending' }), // Add this line
      Enrollment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      pendingCourses, // Add this line
      totalEnrollments,
      totalRevenue: revenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Stats fetch failed' });
  }
});
router.get('/courses/pending', isAuthenticated, isAdmin, async (req, res) => {
  const courses = await Course.find({ status: 'pending' })
    .populate('createdBy', 'name email');
  res.json(courses);
});

router.put('/course/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.status = 'published';
  course.adminFeedback = '';
  await course.save();
  res.json({ message: 'Course approved successfully' });
});

router.put('/course/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
  const { feedback } = req.body;

  const course = await Course.findById(req.params.id);
  course.status = 'rejected';
  course.adminFeedback = feedback;

  await course.save();
  res.json({ message: 'Course rejected with feedback' });
});

router.put("/user/:id/block", async (req, res) => {
const user = await User.findById(req.params.id);
user.isBlocked = req.body.block; // use true/false from frontend
await user.save();
res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });

});

// Dashboard Stats
router.get('/dashboard-stats', isAuthenticated, isAdmin, adminController.getDashboardStats);

// Export Endpoints
router.get('/export/users', isAuthenticated, isAdmin, adminController.exportUsersCSV);
router.get('/export/courses', isAuthenticated, isAdmin, adminController.exportCoursesCSV);

router.get('/enrollments', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/payments', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Transform the data to ensure proper number format
    const transformedPayments = payments.map(payment => ({
      ...payment,
      amount: Number(payment.amount) || 0, // Ensure it's a number
      courseId: payment.courseId ? {
        ...payment.courseId,
        price: Number(payment.courseId?.price) || 0
      } : null
    }));

    // Debug log
    console.log('First payment amount:', {
      raw: payments[0]?.amount,
      transformed: transformedPayments[0]?.amount,
      typeRaw: typeof payments[0]?.amount,
      typeTransformed: typeof transformedPayments[0]?.amount
    });

    res.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: error.message });
  }
});
// Toggle course visibility
// routes/admin.js - Fix the status update route
router.put('/course/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['draft', 'pending', 'published', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update course status
    course.status = status;
    await course.save();
    
    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      course 
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});
router.delete('/course/:id/delete',isAuthenticated,isAdmin,courseController.deleteCourse)


module.exports = router;
