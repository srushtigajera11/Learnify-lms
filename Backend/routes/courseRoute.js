const express = require('express');
const router = express.Router();

const courseController = require('../controller/courseController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/uploadMiddleware');

// CREATE course (tutor only)
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.createCourse
);

// GET routes - from specific to general
router.get('/my-course', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourses);
router.get('/my-course/:id', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourseById);

// ✅ ADD THIS MISSING ROUTE
router.get('/', isAuthenticated, courseController.getAllCourses);
router.get('/tutor/courses',isAuthenticated, authorizeRoles('tutor'), courseController.getCoursesByStatus);

// Submit course for review
router.put('/:id/submit', isAuthenticated, authorizeRoles('tutor'), courseController.submitForReview);

// Update course status (for fixing rejected courses)
router.put('/:id/status', isAuthenticated, authorizeRoles('tutor'),courseController.updateCourseStatus);

// Get tutor dashboard stats
router.get('/tutor/stats', isAuthenticated, authorizeRoles('tutor'),courseController.getTutorStats);

// ============================================
// ADMIN ROUTES (requires admin role)
// ============================================

// Get pending courses for admin approval
router.get('/admin/pending', isAuthenticated, authorizeRoles('admin'),courseController.getPendingCourses);

// Approve course
router.put('/admin/:id/approve', isAuthenticated, authorizeRoles('admin'), courseController.approveCourse);

// Reject course with feedback
router.put('/admin/:id/reject', isAuthenticated, authorizeRoles('admin'), courseController.rejectCourse);

// Get admin dashboard stats
router.get('/admin/dashboard', isAuthenticated, authorizeRoles('admin'), courseController.getAdminDashboard);
 


router.get('/:courseId', isAuthenticated,courseController.getCourseDetails);

// UPDATE course (tutor only)
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.updateMyCourse
);

// DELETE course (tutor only)
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.deleteCourse
);


module.exports = router;