const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// Import models
const Enrollment = require('../models/Enrollment');
const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');

// Get enrolled courses
router.get('/ecourses', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all enrollments of the student
    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description createdBy thumbnail',
        populate: { path: 'createdBy', select: 'name' }
      })
      .populate('progress.lessonId', 'title');

    if (!enrollments.length) {
      return res.status(404).json({ success: false, message: 'No enrolled courses found' });
    }

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await Lesson.countDocuments({
          courseId: enrollment.courseId._id,
          status: 'published'
        });
        
        const completedLessons = enrollment.progress 
          ? enrollment.progress.filter(p => p.completed).length 
          : 0;
        
        const progress = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;

        return {
          ...enrollment.toObject(),
          progress,
          totalLessons,
          completedLessons
        };
      })
    );

    res.status(200).json({ success: true, enrollments: enrollmentsWithProgress });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all courses for students
router.get('/courses', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await Course.find({status: "published"}).populate('createdBy','name');
    const enrollments = await Enrollment.find({studentId}).select('courseId');
    const enrollInCourseIds = enrollments.map((e) => e.courseId.toString());
    
    const courseWithMeta = await Promise.all(
      courses.map(async(course) => {
        const totalLessons = await Lesson.countDocuments({
          courseId : course._id,
        });
        return {
          ...course.toObject(),
          totalLessons,
          isEnrolled: enrollInCourseIds.includes(course._id.toString()),
        }
      })
    );
    
    res.status(200).json({success: true, message: "course fetched successfully", courses: courseWithMeta});
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Enroll in course
router.post('/enroll/:courseId', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Course not found or unpublished' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ courseId, studentId });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Enroll student
    const enrollment = await Enrollment.create({ courseId, studentId });
    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get course details
router.get('/course-details/:courseId', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find course with all details
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email')
      .populate('category', 'name');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // For students: check if enrolled
    if (userRole === 'student') {
      const isEnrolled = await Enrollment.findOne({ 
        courseId, 
        studentId: userId 
      });

      // If enrolled, return course with lessons
      if (isEnrolled) {
        const lessons = await Lesson.find({ 
          courseId, 
          status: 'published' 
        }).sort('order');
        
        return res.status(200).json({
          success: true,
          course: {
            ...course.toObject(),
            lessons: lessons,
            isEnrolled: true
          }
        });
      }
      
      // If not enrolled but course is published, return basic details
      if (course.status === 'published') {
        const totalLessons = await Lesson.countDocuments({ courseId });
        
        return res.status(200).json({
          success: true,
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            price: course.price,
            level: course.level,
            category: course.category,
            createdBy: course.createdBy,
            status: course.status,
            rating: course.rating,
            totalLessons,
            isEnrolled: false
          }
        });
      }
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this course'
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
});

// Get course lessons
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

    // Get completed lesson IDs
    const completedLessonIds = enrollment.progress 
      ? enrollment.progress.filter(p => p.completed).map(p => p.lessonId.toString())
      : [];

    // Add completion status to lessons
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toObject(),
      isCompleted: completedLessonIds.includes(lesson._id.toString())
    }));

    res.status(200).json({
      success: true,
      lessons: lessonsWithStatus
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
});

// MARK LESSON COMPLETE
router.post('/progress/:courseId/lessons/:lessonId/complete', 
  isAuthenticated, 
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;
      const studentId = req.user.id;

      // Find enrollment
      const enrollment = await Enrollment.findOne({
        studentId,
        courseId
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Not enrolled in this course'
        });
      }

      // Initialize progress array if it doesn't exist
      if (!enrollment.progress) {
        enrollment.progress = [];
      }

      // Check if already completed
      const alreadyCompleted = enrollment.progress.some(
        p => p.lessonId && p.lessonId.toString() === lessonId && p.completed
      );

      if (!alreadyCompleted) {
        // Add or update progress
        const existingIndex = enrollment.progress.findIndex(
          p => p.lessonId && p.lessonId.toString() === lessonId
        );

        if (existingIndex !== -1) {
          enrollment.progress[existingIndex].completed = true;
          enrollment.progress[existingIndex].completedAt = new Date();
        } else {
          enrollment.progress.push({
            lessonId,
            completed: true,
            completedAt: new Date()
          });
        }

        await enrollment.save();
      }

      res.status(200).json({
        success: true,
        message: 'Lesson marked as complete'
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  }
);
// Add this route to studentRoute.js
router.get('/course/:courseId/lesson/:lessonId', 
  isAuthenticated, 
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;
      const studentId = req.user.id;

      // Check enrollment
      const enrollment = await Enrollment.findOne({
        studentId,
        courseId
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must enroll in this course first'
        });
      }

      // Get lesson with all details including content and materials
      const lesson = await Lesson.findById(lessonId)
        .populate('materials')
        .populate('quizId')
        .lean();

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Get all lessons for navigation
      const lessons = await Lesson.find({ courseId })
        .sort('order')
        .lean();

      const currentIndex = lessons.findIndex(l => l._id.toString() === lessonId);
      const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

      // Check if completed
      const isCompleted = enrollment.progress 
        ? enrollment.progress.some(p => 
            p.lessonId && p.lessonId.toString() === lessonId && p.completed
          )
        : false;

      res.status(200).json({
        success: true,
        lesson: {
          ...lesson,
          isCompleted,
          previousLesson: previousLesson ? {
            _id: previousLesson._id,
            title: previousLesson.title
          } : null,
          nextLesson: nextLesson ? {
            _id: nextLesson._id,
            title: nextLesson.title
          } : null
        }
      });

    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  }
);

// Get course progress
router.get('/progress/:courseId', isAuthenticated, authorizeRoles('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    const totalLessons = await Lesson.countDocuments({ 
      courseId,
      status: 'published'
    });
    
    const completedLessons = enrollment.progress 
      ? enrollment.progress.filter(p => p.completed).length 
      : 0;
    
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      progress: {
        percentage: progress,
        completedLessons,
        totalLessons,
        completedLessonsList: enrollment.progress || []
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

module.exports = router;