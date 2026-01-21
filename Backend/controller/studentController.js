const Enrollment = require('../models/Enrollment');
const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');

// Get enrolled courses - COMPATIBLE VERSION
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description createdBy thumbnail category level rating',
        populate: { 
          path: 'createdBy', 
          select: 'name' 
        }
      });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total lessons in course
        const totalLessons = await Lesson.countDocuments({ 
          courseId: enrollment.courseId._id,
          status: 'published'
        });
        
        // Get completed lessons from enrollment.progress array
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
          completedLessons,
          // Simulate lastAccessed with updatedAt
          lastAccessed: {
            lessonId: enrollment.progress && enrollment.progress.length > 0 
              ? enrollment.progress[enrollment.progress.length - 1].lessonId 
              : null,
            accessedAt: enrollment.updatedAt
          }
        };
      })
    );

    res.status(200).json({ 
      success: true, 
      enrollments: enrollmentsWithProgress 
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Mark lesson as complete - COMPATIBLE VERSION
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
      p => p.lessonId.toString() === lessonId && p.completed
    );

    if (alreadyCompleted) {
      return res.status(200).json({
        success: true,
        message: 'Lesson already completed'
      });
    }

    // Mark as completed
    const progressIndex = enrollment.progress.findIndex(
      p => p.lessonId.toString() === lessonId
    );

    if (progressIndex !== -1) {
      // Update existing progress entry
      enrollment.progress[progressIndex].completed = true;
      enrollment.progress[progressIndex].completedAt = new Date();
    } else {
      // Add new progress entry
      enrollment.progress.push({
        lessonId,
        completed: true,
        completedAt: new Date()
      });
    }

    await enrollment.save();

    // Calculate progress
    const totalLessons = await Lesson.countDocuments({ 
      courseId,
      status: 'published'
    });
    
    const completedLessons = enrollment.progress.filter(p => p.completed).length;
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      progress,
      completedLessons,
      totalLessons
    });

  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get course details with lessons - COMPATIBLE VERSION
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    const isEnrolled = !!enrollment;

    // Get course
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name')
      .populate('category', 'name')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get lessons
    const lessons = await Lesson.find({ 
      courseId,
      status: 'published' 
    })
    .sort('order')
    .lean();

    // Get completed lesson IDs
    const completedLessonIds = enrollment && enrollment.progress
      ? enrollment.progress
          .filter(p => p.completed)
          .map(p => p.lessonId.toString())
      : [];

    // Enhance lessons with status
    const lessonsWithStatus = lessons.map((lesson, index) => {
      const isCompleted = completedLessonIds.includes(lesson._id.toString());
      const isUnlocked = index === 0 || 
        completedLessonIds.includes(lessons[index - 1]?._id.toString());
      
      return {
        ...lesson,
        isCompleted,
        isUnlocked
      };
    });

    // Calculate overall progress
    const totalLessons = lessons.length;
    const completedLessons = completedLessonIds.length;
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      course: {
        ...course,
        lessons: lessonsWithStatus,
        isEnrolled,
        progress,
        totalLessons,
        completedLessons,
        enrollmentId: enrollment?._id
      }
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Update other functions similarly...