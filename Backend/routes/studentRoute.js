const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const studentController = require('../controller/studentController');

// Routes for student operations
router.get('/courses', isAuthenticated, authorizeRoles('student') , studentController.getAllCoursesForStudents);
router.get('/ecourses',isAuthenticated, authorizeRoles('student'), studentController.getEnrolledCourses);
router.post(
  '/enroll/:courseId',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.enrollInCourse
);
module.exports = router;
