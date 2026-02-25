const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const studentContentController = require('../controller/StudentContentController');

// All routes require authentication and student role
router.use(isAuthenticated, authorizeRoles('student'));

// Get all course content (lessons + quizzes)
router.get(
  '/course/:courseId/content',
  studentContentController.getUnifiedCourseContent
);

// Get specific lesson
router.get(
  '/course/:courseId/lesson/:lessonId',
  studentContentController.getLessonContent
);

// Get specific quiz
router.get(
  '/course/:courseId/quiz/:quizId',
  studentContentController.getQuizContent
);

// Mark lesson complete
router.post(
  '/course/:courseId/lesson/:lessonId/complete',
  studentContentController.markLessonComplete
);

// Submit quiz attempt
router.post(
  '/course/:courseId/quiz/:quizId/submit',
  studentContentController.submitQuizAttempt
);

module.exports = router;