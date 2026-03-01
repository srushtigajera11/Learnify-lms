const express = require('express');
const router  = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// GET handlers live in StudentContentController
const studentContentController = require('../controller/StudentContentController');

// POST (mutation) handlers live in progressController
const progressController = require('../controller/progressController');

// All routes require authentication and student role
router.use(isAuthenticated, authorizeRoles('student'));

// Get all course content (lessons + quizzes + certificate slot)
router.get('/course/:courseId/content',
  studentContentController.getUnifiedCourseContent
);

// Get specific lesson
router.get('/course/:courseId/lesson/:lessonId',
  studentContentController.getLessonContent
);

// Get specific quiz
router.get('/course/:courseId/quiz/:quizId',
  studentContentController.getQuizContent
);

// Mark lesson complete  <-- comes from progressController, NOT studentContentController
router.post('/course/:courseId/lesson/:lessonId/complete',
  progressController.markLessonComplete
);

// Submit quiz attempt  <-- comes from progressController, NOT studentContentController
router.post('/course/:courseId/quiz/:quizId/submit',
  progressController.submitQuizAttempt
);

// Get progress for this course
router.get('/course/:courseId/progress',
  progressController.getCourseProgress
);

// Get progress for all enrolled courses
router.get('/progress/all',
  progressController.getAllProgress
);

module.exports = router;