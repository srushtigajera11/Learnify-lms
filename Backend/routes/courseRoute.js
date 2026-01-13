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
router.get('/tutor/courses',isAuthenticated, authorizeRoles('tutor'), courseController.getCoursesByStatus);

// Submit course for review
router.put('/:id/submit', isAuthenticated, authorizeRoles('tutor'), courseController.submitForReview);

// Update course status (for fixing rejected courses)
router.put('/:id/status', isAuthenticated, authorizeRoles('tutor'),courseController.updateCourseStatus);

// Get tutor dashboard stats
router.get('/tutor/stats', isAuthenticated, authorizeRoles('tutor'),courseController.getTutorStats);

// ============================================
// ADMIN ROUTES (requires admin role)
// ============================================

// Get pending courses for admin approval
router.get('/admin/pending', isAuthenticated, authorizeRoles('admin'),courseController.getPendingCourses);

// Approve course
router.put('/admin/:id/approve', isAuthenticated, authorizeRoles('admin'), courseController.approveCourse);

// Reject course with feedback
router.put('/admin/:id/reject', isAuthenticated, authorizeRoles('admin'), courseController.rejectCourse);

// Get admin dashboard stats
router.get('/admin/dashboard', isAuthenticated, authorizeRoles('admin'), courseController.getAdminDashboard);
 


router.get('/:courseId', isAuthenticated,courseController.getCourseDetails);

// UPDATE course (tutor only)
router.put(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  uploadThumbnail.single('thumbnail'),
  courseController.updateMyCourse
);
// Add these to your course routes

// GET /courses/:id/stats
router.get('/:id/stats', isAuthenticated, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'sections.lessons',
        select: 'duration'
      });

    // Calculate stats
    let totalLessons = 0;
    let totalDuration = 0;

    if (course.sections) {
      course.sections.forEach(section => {
        if (section.lessons) {
          totalLessons += section.lessons.length;
          section.lessons.forEach(lesson => {
            totalDuration += lesson.duration || 0;
          });
        }
      });
    }

    res.json({
      success: true,
      stats: {
        totalLessons,
        totalDuration, // in minutes
        totalSections: course.sections?.length || 0,
        completeness: calculateCompleteness(course)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /courses/:id/feedback (for internal notes)
router.put('/:id/feedback', isAuthenticated, async (req, res) => {
  try {
    const { feedback } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { instructorNotes: feedback },
      { new: true }
    );
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE course (tutor only)
router.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('tutor'),
  courseController.deleteCourse
);


module.exports = router;