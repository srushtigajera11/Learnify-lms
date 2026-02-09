const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Wishlist = require('../models/Wishlist');
const Certificate = require('../models/Certificate');
const mongoose = require('mongoose')
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
// controllers/statsController.js or studentController.js
// studentController.js - Add this function
exports.getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get enrolled courses count
    const enrolledCount = await Enrollment.countDocuments({ studentId });
    
    // Get completed courses (where progress is 100%)
    const enrollments = await Enrollment.find({ studentId });
    let completedCount = 0;
    
    for (const enrollment of enrollments) {
      const totalLessons = await Lesson.countDocuments({ 
        courseId: enrollment.courseId 
      });
      
      if (totalLessons > 0) {
        const progress = Math.round((enrollment.completedLessons?.length / totalLessons) * 100);
        if (progress === 100) {
          completedCount++;
        }
      }
    }
    
    // Get certificates count
    const certificatesCount = await Certificate.countDocuments({ studentId });
    
    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        certificates: certificatesCount || 0
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard stats"
    });
  }
};
/**
 * Get all available courses with enrollment status
 */
exports.getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses = await Course.find({ status: "published" })
      .select("title description price thumbnail");

    const enrollments = await Enrollment.find({ studentId })
      .select("courseId");

    const enrolledCourseIds = enrollments.map(e => e.courseId.toString());

    const coursesWithStatus = courses.map(course => ({
      ...course.toObject(),
      isEnrolled: enrolledCourseIds.includes(course._id.toString())
    }));

    res.status(200).json({
      success: true,
      courses: coursesWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};


exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    let course;
    try {
      course = await Course.findById(courseId)
        .populate('createdBy', 'name email avatar')
        .lean();
    } catch (dbError) {
      console.error("MongoDB error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const enrollment = await Enrollment.findOne({
      courseId,
      studentId
    });

    const totalLessons = await Lesson.countDocuments({
      courseId,
      status: "published"
    });

    let firstLesson = null;
    if (enrollment) {
      firstLesson = await Lesson.findOne({
        courseId,
        status: "published"
      }).sort("order").select("_id title");
    }

    res.status(200).json({
      success: true,
      course: {
        ...course,
        isEnrolled: !!enrollment,
        totalLessons,
        firstLesson
      }
    });
  } catch (error) {
    console.error("Get course details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching course details"
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
exports.getSearchCourse = async(req,res)=>{
   try {
      const { q = "", limit = 20 } = req.query;

      const searchQuery = q.trim()
        ? {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { description: { $regex: q, $options: "i" } },
              { category: { $regex: q, $options: "i" } },
            ],
          }
        : {};

      const courses = await Course.find(searchQuery)
        .limit(Number(limit))
        .select("title description category price thumbnail level rating");

      res.status(200).json({
        success: true,
        totalCourses: courses.length,
        courses,
      });
    } catch (error) {
      console.error("Course search error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search courses",
      });
    }
}
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