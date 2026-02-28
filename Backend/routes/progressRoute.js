const express = require('express');
const router  = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const progressController = require('../controller/progressController');

const auth = [isAuthenticated, authorizeRoles('student')];

// Mark lesson complete
router.post('/:courseId/lessons/:lessonId/complete',
  ...auth,
  progressController.markLessonComplete        // ← was markLessonCompleted
);

// Submit quiz attempt
router.post('/:courseId/quiz/:quizId/submit',
  ...auth,
  progressController.submitQuizAttempt         // ← was updateQuizScore
);

// Get progress for one course
router.get('/:courseId',
  ...auth,
  progressController.getCourseProgress
);

// Get progress for all enrolled courses
router.get('/',
  ...auth,
  progressController.getAllProgress
);

module.exports = router;