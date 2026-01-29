const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// IMPORTANT: All routes are prefixed with '/api/students' in server.js

// Get course details
router.get(
  '/course-details/:courseId',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getCourseDetails
);

// Get all lessons for a course
router.get(
  '/courses/:courseId/lessons',  // Changed from /course/:courseId/lessons
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getCourseLessons
);
// studentRoutes.js - Add this route
router.get(
  '/dashboard-stats',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getStudentDashboardStats
);

// Get single lesson with navigation
router.get(
  '/courses/:courseId/lessons/:lessonId',  // Changed from /course/:courseId/lesson/:lessonId
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getLesson
);

// Mark lesson as complete
router.post(
  '/courses/:courseId/lessons/:lessonId/complete',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.markLessonComplete
);

router.get(
  '/courses',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getAvailableCourses
);

// Get enrolled courses
router.get(
  '/enrolled-courses',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getEnrolledCourses
);
// Get course progress
router.get(
  '/courses/:courseId/progress',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.getCourseProgress
);

module.exports = router;