
const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const uploadMaterials = require('../middleware/upload'); // Import the multer middleware


router.post(
  '/:courseId/add-lesson',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadMaterials,  // <--- use multer.any() here
  lessonController.addLesson
);




router.get('/lesson/:lessonId', isAuthenticated, authorizeRoles('tutor'), lessonController.getLessonById);
router.put('/lesson/:lessonId', isAuthenticated, authorizeRoles('tutor'), lessonController.updateLesson);
router.delete('/lesson/:lessonId', isAuthenticated, authorizeRoles('tutor'), lessonController.deleteLesson);
router.get('/:courseId', isAuthenticated, authorizeRoles('tutor'), lessonController.getLessonsByCourse);
module.exports = router;
