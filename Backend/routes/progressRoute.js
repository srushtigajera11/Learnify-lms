// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const progressController = require('../controller/progressController');

// Lesson completion
router.post('/:courseId/lessons/:lessonId/complete', 
  isAuthenticated, 
  authorizeRoles('student'), 
  progressController.markLessonCompleted
);

// Get course progress
router.get('/:courseId', 
  isAuthenticated, 
  authorizeRoles('student'), 
  progressController.getCourseProgress
);

// Get all courses progress
router.get('/', 
  isAuthenticated, 
  authorizeRoles('student'), 
  progressController.getAllProgress
);

// Update quiz score
router.post('/:courseId/quiz', 
  isAuthenticated, 
  authorizeRoles('student'), 
  progressController.updateQuizScore
);

module.exports = router;