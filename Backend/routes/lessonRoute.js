const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const uploadMaterials = require('../middleware/upload');

// POST - Add lesson with file uploads
router.post(
  '/:courseId/add-lesson',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadMaterials,
  lessonController.addLesson
);

// PUT - Update lesson with file uploads
router.put(
  '/lesson/:lessonId',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadMaterials,  // <-- ADD THIS for update route too!
  lessonController.updateLesson
);

// Other routes...
router.get('/lesson/:lessonId', isAuthenticated, authorizeRoles('tutor'), lessonController.getLessonById);
router.delete('/lesson/:lessonId', isAuthenticated, authorizeRoles('tutor'), lessonController.deleteLesson);
router.get('/:courseId', isAuthenticated, authorizeRoles('tutor'), lessonController.getLessonsByCourse);
module.exports = router;