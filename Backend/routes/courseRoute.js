const express = require('express');
const router = express.Router();

const courseController = require('../controller/courseController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/uploadMiddleware');

/* ============================================
   CREATE COURSE
============================================ */
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.createCourse
);

/* ============================================
   SPECIFIC ROUTES FIRST (VERY IMPORTANT)
============================================ */

// Tutor dashboard stats
router.get(
  '/tutor/stats',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.getTutorStats
);

// Tutor courses by status
router.get(
  '/tutor/courses',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.getCoursesByStatus
);

// Tutor own courses
router.get(
  '/my-course',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.getMyCourses
);

router.get(
  '/my-course/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.getMyCourseById
);

// Admin routes
router.get(
  '/admin/pending',
  isAuthenticated,
  authorizeRoles('admin'),
  courseController.getPendingCourses
);

router.put(
  '/admin/:id/approve',
  isAuthenticated,
  authorizeRoles('admin'),
  courseController.approveCourse
);

router.put(
  '/admin/:id/reject',
  isAuthenticated,
  authorizeRoles('admin'),
  courseController.rejectCourse
);

router.get(
  '/admin/dashboard',
  isAuthenticated,
  authorizeRoles('admin'),
  courseController.getAdminDashboard
);

/* ============================================
   COURSE-SPECIFIC ROUTES
============================================ */

// Submit course
router.put(
  '/:id/submit',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.submitForReview
);

// Update course status
router.put(
  '/:id/status',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.updateCourseStatus
);

// Course stats (single correct definition)
router.get(
  '/:id/stats',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.getCourseStats
);

// Update course
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.updateMyCourse
);

// Delete course
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.deleteCourse
);

/* ============================================
   GENERAL ROUTES LAST
============================================ */

// Get all courses
router.get(
  '/',
  isAuthenticated,
  courseController.getAllCourses
);

// Get course details (KEEP LAST)
router.get(
  '/:courseId',
  isAuthenticated,
  courseController.getCourseDetails
);

module.exports = router;