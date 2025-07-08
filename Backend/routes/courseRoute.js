const express = require('express');
const router = express.Router();

const courseController = require('../controller/courseController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/uploadMiddleware'); // your multer config for Cloudinary upload

// Create course (tutor only) with thumbnail upload (single file field named 'thumbnail')
router.post(
  '/',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),  // multer middleware to handle thumbnail upload
  courseController.createCourse

);

// Get all courses (any logged-in user)
// ✅ Specific routes first
router.get('/my-course', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourses);
router.get('/my-course/:id', isAuthenticated, authorizeRoles('tutor'), courseController.getMyCourseById);
router.get('/:courseId', isAuthenticated, authorizeRoles('student'), courseController.getCourseDetails);

// Update course (tutor only) with optional thumbnail upload
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),  // optional thumbnail update
  courseController.updateMyCourse
);

// Delete course (tutor only)
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.deleteCourse
);

module.exports = router;
