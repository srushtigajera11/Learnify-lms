// routes/quizRoutes.js
const express = require('express');
const quizController = require('../controller/quizController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Since routes are mounted at /api/quizzes, update the paths:

// POST /api/quizzes/:courseId
router.post(
  '/:courseId',
  isAuthenticated,
  authorizeRoles('tutor'),
  quizController.createQuiz
);

// GET /api/quizzes/:courseId
router.get(
  '/:courseId',
  isAuthenticated,
  authorizeRoles('tutor', 'student'),
  quizController.getQuizzesByCourse
);

// Keep these as they are (they're already correct)
router.get(
  '/quiz/:quizId',
  isAuthenticated,
  authorizeRoles('tutor', 'student'),
  quizController.getQuizById
);

router.put(
  '/quiz/:quizId',
  isAuthenticated,
  authorizeRoles('tutor'),
  quizController.updateQuiz
);

router.delete(
  '/quiz/:quizId',
  isAuthenticated,
  authorizeRoles('tutor'),
  quizController.deleteQuiz
);

router.patch(
  '/quiz/:quizId/publish',
  isAuthenticated,
  authorizeRoles('tutor'),
  quizController.togglePublish
);

module.exports = router;