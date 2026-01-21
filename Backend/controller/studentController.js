const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

/**
 * Get enrolled courses for student
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description thumbnail price level category createdBy',
        populate: { 
          path: 'createdBy', 
          select: 'name avatar' 
        }
      })
      .sort('-createdAt');

    if (!enrollments.length) {
      return res.status(200).json({ 
        success: true, 
        enrollments: [] 
      });
    }

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await Lesson.countDocuments({
          courseId: enrollment.courseId._id,
          status: 'published'
        });
        
        const completedLessons = enrollment.completedLessons?.length || 0;
        const progress = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;

        return {
          _id: enrollment._id,
          course: enrollment.courseId,
          enrolledAt: enrollment.createdAt,
          progress,
          totalLessons,
          completedLessons,
          lastAccessed: enrollment.updatedAt
        };
      })
    );

    res.status(200).json({ 
      success: true, 
      enrollments: enrollmentsWithProgress 
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching enrolled courses' 
    });
  }
};

/**
 * Get course details with enrollment status
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Get course with instructor details
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email avatar')
      .populate('category', 'name');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({ 
      courseId, 
      studentId 
    });

    const isEnrolled = !!enrollment;

    // Get published lessons count
    const totalLessons = await Lesson.countDocuments({ 
      courseId, 
      status: 'published' 
    });

    // If enrolled, get first lesson for navigation
    let firstLesson = null;
    if (isEnrolled) {
      firstLesson = await Lesson.findOne({ 
        courseId, 
        status: 'published' 
      })
      .sort('order')
      .select('_id title');
    }

    const courseData = {
      ...course.toObject(),
      totalLessons,
      isEnrolled,
      firstLesson: firstLesson ? {
        _id: firstLesson._id,
        title: firstLesson.title
      } : null
    };

    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching course details' 
    });
  }
};

/**
 * Get all lessons for a course
 */
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check enrollment
    const enrollment = await Enrollment.findOne({ 
      courseId, 
      studentId 
    });
    
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'Enroll in this course to view lessons' 
      });
    }

    // Get published lessons
    const lessons = await Lesson.find({ 
      courseId, 
      status: 'published' 
    })
    .sort('order')
    .select('_id title description lessonType order duration isPreview materials');

    // Get completed lesson IDs
    const completedLessonIds = enrollment.completedLessons || [];

    // Add completion status to lessons
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toObject(),
      isCompleted: completedLessonIds.includes(lesson._id.toString())
    }));

    res.status(200).json({
      success: true,
      lessons: lessonsWithStatus,
      totalLessons: lessons.length,
      completedLessons: completedLessonIds.length
    });
  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching lessons' 
    });
  }
};

/**
 * Get single lesson with navigation
 */
// controllers/studentController.js - Update getLesson function

exports.getLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    console.log('=== GET LESSON REQUEST ===');
    console.log('Course ID:', courseId);
    console.log('Lesson ID:', lessonId);
    console.log('Student ID:', studentId);

    // Check enrollment
    const enrollment = await Enrollment.findOne({ 
      courseId, 
      studentId 
    });

    console.log('Enrollment found:', !!enrollment);
    console.log('Enrollment data:', enrollment);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Enroll in this course to view this lesson'
      });
    }

    // Get the requested lesson
    const lesson = await Lesson.findOne({
      _id: lessonId,
      courseId,
      status: 'published'
    }).select('-__v');

    console.log('Lesson found:', !!lesson);
    console.log('Lesson data:', lesson);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or not published'
      });
    }

    // Get all lessons for navigation
    const allLessons = await Lesson.find({ 
      courseId, 
      status: 'published' 
    })
    .sort('order')
    .select('_id title');

    console.log('All lessons count:', allLessons.length);

    const currentIndex = allLessons.findIndex(l => l._id.toString() === lessonId);
    console.log('Current index:', currentIndex);
    
    // Get previous and next lessons
    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    console.log('Previous lesson:', previousLesson);
    console.log('Next lesson:', nextLesson);

    // Check if lesson is completed
    const isCompleted = enrollment.completedLessons?.includes(lessonId) || false;
    console.log('Is completed:', isCompleted);

    // Auto-detect lesson type
    let lessonType = lesson.lessonType;
    if (!lessonType) {
      if (lesson.materials && lesson.materials.length > 0) {
        const hasVideo = lesson.materials.some(m => 
          m.type === 'video' || 
          (m.url && (m.url.includes('youtube') || m.url.includes('vimeo')))
        );
        if (hasVideo) {
          lessonType = 'video';
        } else if (lesson.materials.some(m => m.type === 'document' || m.type === 'pdf')) {
          lessonType = 'document';
        } else {
          lessonType = 'text';
        }
      } else if (lesson.content && lesson.content.trim().length > 0) {
        lessonType = 'text';
      } else if (lesson.description && lesson.description.trim().length > 0) {
        lessonType = 'text';
      } else {
        lessonType = 'document';
      }
    }

    console.log('Detected lesson type:', lessonType);

    const lessonData = {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      materials: lesson.materials || [],
      order: lesson.order,
      lessonType: lessonType,
      duration: lesson.duration,
      isPreview: lesson.isPreview || false,
      isCompleted,
      navigation: {
        currentIndex: currentIndex + 1,
        totalLessons: allLessons.length,
        previousLesson: previousLesson ? {
          _id: previousLesson._id,
          title: previousLesson.title
        } : null,
        nextLesson: nextLesson ? {
          _id: nextLesson._id,
          title: nextLesson.title
        } : null
      }
    };

    console.log('Sending lesson data:', JSON.stringify(lessonData, null, 2));

    res.status(200).json({
      success: true,
      lesson: lessonData
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lesson',
      error: error.message
    });
  }
};

/**
 * Mark lesson as complete
 */
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    // Find enrollment
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

    // Check if lesson exists and is published
    const lesson = await Lesson.findOne({
      _id: lessonId,
      courseId,
      status: 'published'
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Initialize completedLessons array if needed
    if (!enrollment.completedLessons) {
      enrollment.completedLessons = [];
    }

    // Add lesson if not already completed
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      await enrollment.save();
    }

    // Calculate progress
    const totalLessons = await Lesson.countDocuments({ 
      courseId, 
      status: 'published' 
    });
    const progress = totalLessons > 0 
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      progress: {
        percentage: progress,
        completedLessons: enrollment.completedLessons.length,
        totalLessons,
        isCompleted: true
      }
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking lesson complete'
    });
  }
};

/**
 * Get course progress
 */
exports.getCourseProgress = async (req, res) => {
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
    
    const completedLessons = enrollment.completedLessons?.length || 0;
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      progress: {
        percentage: progress,
        completedLessons,
        totalLessons,
        completedLessonIds: enrollment.completedLessons || []
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching progress'
    });
  }
};