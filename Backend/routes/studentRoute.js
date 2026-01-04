const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const studentController = require('../controller/studentController');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');

// Routes for student operations
router.get('/courses', isAuthenticated, authorizeRoles('student') , studentController.getAllCoursesForStudents);
router.get('/ecourses',isAuthenticated, authorizeRoles('student'), studentController.getEnrolledCourses);
router.post(
  '/enroll/:courseId',
  isAuthenticated,
  authorizeRoles('student'),
  studentController.enrollInCourse
);
router.get('/course-details/:courseId', isAuthenticated, authorizeRoles('student'), studentController.getCourseDetails);
router.get('/course/:courseId/lessons', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({ courseId, studentId });
    
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'You need to enroll in this course to view lessons' 
      });
    }

    // Get lessons
    const lessons = await Lesson.find({ 
      courseId, 
      status: 'published' 
    }).sort('order');

    res.status(200).json({
      success: true,
      lessons
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
});
module.exports = router;
