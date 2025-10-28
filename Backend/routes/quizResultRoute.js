const express = require('express');
const {
  submitQuizAttempt,
  getStudentQuizResults,
  getQuizResultsForTutor,
  getQuizResultById
} = require('../controller/quizResultController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes protected
router.use(isAuthenticated);

// Student routes
router.post(
  '/quiz/:quizId/attempt',
  authorizeRoles('student'),
  submitQuizAttempt
);

router.get(
  '/quiz/:quizId',
  authorizeRoles('student'),
  getStudentQuizResults
);

// Tutor routes
router.get(
  '/quiz/:quizId/tutor',
  authorizeRoles('tutor'),
  getQuizResultsForTutor
);

// Shared routes
router.get(
  '/:resultId',
  authorizeRoles('student', 'tutor'),
  getQuizResultById
);

module.exports = router;