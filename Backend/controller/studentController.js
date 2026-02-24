const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Wishlist = require('../models/Wishlist');
const Certificate = require('../models/Certificate');
const mongoose = require('mongoose');

/**
 * Get enrolled courses for student
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Step 1: Fetch enrollments with populated course
    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: "courseId",
        select:
          "title description thumbnail price level category createdBy",
        populate: {
          path: "createdBy",
          select: "name avatar",
        },
      })
      .sort("-createdAt");

    if (!enrollments.length) {
      return res.status(200).json({
        success: true,
        enrollments: [],
      });
    }

    // Step 2: Remove broken enrollments (course deleted)
    const brokenEnrollments = enrollments.filter(
      (enrollment) => !enrollment.courseId
    );

    if (brokenEnrollments.length > 0) {
      await Enrollment.deleteMany({
        _id: { $in: brokenEnrollments.map((e) => e._id) },
      });
    }

    const validEnrollments = enrollments.filter(
      (enrollment) => enrollment.courseId
    );

    // Step 3: Get all course IDs
    const courseIds = validEnrollments.map(
      (enrollment) => enrollment.courseId._id
    );

    // Step 4: Get lesson counts for all courses in ONE query
    const lessonCounts = await Lesson.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
        },
      },
      {
        $group: {
          _id: "$courseId",
          totalLessons: { $sum: 1 },
        },
      },
    ]);

    // Convert to lookup map
    const lessonCountMap = {};
    lessonCounts.forEach((item) => {
      lessonCountMap[item._id.toString()] = item.totalLessons;
    });

    // Step 5: Format response
    const enrollmentsWithProgress = validEnrollments.map((enrollment) => {
      const courseIdStr = enrollment.courseId._id.toString();

      const totalLessons = lessonCountMap[courseIdStr] || 0;
      const completedLessons =
        enrollment.completedLessons?.length || 0;

      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        _id: enrollment._id,
        course: enrollment.courseId,
        enrolledAt: enrollment.createdAt,
        progress,
        totalLessons,
        completedLessons,
        lastAccessed: enrollment.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      enrollments: enrollmentsWithProgress,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching enrolled courses",
    });
  }
};

// studentController.js - Add this function
exports.getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1️⃣ Fetch enrollments
    const enrollments = await Enrollment.find({ studentId })
      .select("courseId completedLessons");

    if (!enrollments.length) {
      return res.status(200).json({
        success: true,
        stats: {
          enrolledCourses: 0,
          completedCourses: 0,
          certificates: 0,
        },
      });
    }

    // 2️⃣ Remove broken enrollments (course deleted)
    const brokenEnrollments = enrollments.filter(
      (e) => !e.courseId
    );

    if (brokenEnrollments.length > 0) {
      await Enrollment.deleteMany({
        _id: { $in: brokenEnrollments.map(e => e._id) }
      });
    }

    const validEnrollments = enrollments.filter(
      (e) => e.courseId
    );

    const enrolledCount = validEnrollments.length;

    // 3️⃣ Get lesson counts for all courses in ONE query
    const courseIds = validEnrollments.map(e => e.courseId);

    const lessonCounts = await Lesson.aggregate([
      {
        $match: {
          courseId: { $in: courseIds }
        }
      },
      {
        $group: {
          _id: "$courseId",
          totalLessons: { $sum: 1 }
        }
      }
    ]);

    // Convert to lookup map
    const lessonCountMap = {};
    lessonCounts.forEach(item => {
      lessonCountMap[item._id.toString()] = item.totalLessons;
    });

    // 4️⃣ Calculate completed courses
    let completedCount = 0;

    for (const enrollment of validEnrollments) {
      const totalLessons =
        lessonCountMap[enrollment.courseId.toString()] || 0;

      const completedLessons =
        enrollment.completedLessons?.length || 0;

      if (
        totalLessons > 0 &&
        completedLessons === totalLessons
      ) {
        completedCount++;
      }
    }

    // 5️⃣ Certificate count
    const certificatesCount = await Certificate.countDocuments({
      studentId
    });

    return res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        certificates: certificatesCount || 0,
      },
    });

  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching dashboard stats",
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
      courseId
    });

    let firstLesson = null;
    if (enrollment) {
      firstLesson = await Lesson.findOne({
        courseId
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
    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course to view lessons"
      });
    }

    // ✅ FETCH ALL LESSONS (NO STATUS FILTER)
    const lessons = await Lesson.find({ courseId })
      .sort("order")
      .select("_id title description lessonType order duration isPreview materials content");

    const completedLessonIds = enrollment.completedLessons || [];

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
    console.error("Get course lessons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching lessons"
    });
  }
};

exports.getSearchCourse = async(req, res) => {
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
};

exports.getLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      courseId,
      studentId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course to view this lesson"
      });
    }

    // ✅ REMOVE status filter
    const lesson = await Lesson.findOne({
      _id: lessonId,
      courseId
    }).select("_id title description content lessonType materials order duration isPreview");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // Get all lessons for navigation
    const allLessons = await Lesson.find({ courseId })
      .sort("order")
      .select("_id title");

    const currentIndex = allLessons.findIndex(
      l => l._id.toString() === lessonId
    );

    const previousLesson =
      currentIndex > 0 ? allLessons[currentIndex - 1] : null;

    const nextLesson =
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null;

    const isCompleted =
      enrollment.completedLessons?.includes(lessonId) || false;

    // ✅ Ensure materials array exists and is properly formatted
    const lessonData = lesson.toObject();
    
    // Format materials for frontend
    if (lessonData.materials && Array.isArray(lessonData.materials)) {
      lessonData.materials = lessonData.materials.map(material => ({
        _id: material._id || material.id,
        name: material.name || 'Untitled Material',
        url: material.url || '',
        type: material.type || 'document',
        description: material.description || ''
      }));
    }

    res.status(200).json({
      success: true,
      lesson: {
        ...lessonData,
        isCompleted,
        navigation: {
          currentIndex: currentIndex + 1,
          totalLessons: allLessons.length,
          previousLesson,
          nextLesson
        }
      }
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching lesson"
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

    // Check if lesson exists
    const lesson = await Lesson.findOne({
      _id: lessonId,
      courseId
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
      courseId
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
      courseId
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