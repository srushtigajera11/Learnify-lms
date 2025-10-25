const express = require('express');
const router = express.Router();

const courseController = require('../controller/courseController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/uploadMiddleware');

// CREATE course (tutor only)
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.createCourse
);

// GET routes - from specific to general
router.get('/my-course', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourses);
router.get('/my-course/:id', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourseById);

// ✅ ADD THIS MISSING ROUTE
router.get('/', isAuthenticated, courseController.getAllCourses);

router.get('/:courseId', isAuthenticated, courseController.getCourseDetails);

// UPDATE course (tutor only)
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.updateMyCourse
);

// DELETE course (tutor only)
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.deleteCourse
);

module.exports = router;