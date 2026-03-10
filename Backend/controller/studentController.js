const Course          = require('../models/courseModel');
const Lesson          = require('../models/Lesson');
const Enrollment      = require('../models/Enrollment');
const Certificate     = require('../models/Certificate');
const StudentProgress = require('../models/StudentProgress');
const mongoose        = require('mongoose');

// ─── Get enrolled courses (progress from StudentProgress) ────────────────────
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description thumbnail price level category createdBy',
        populate: { path: 'createdBy', select: 'name avatar' },
      })
      .sort('-createdAt');

    if (!enrollments.length) {
      return res.status(200).json({ success: true, enrollments: [] });
    }

    // Clean up enrollments whose course was deleted
    const broken = enrollments.filter((e) => !e.courseId);
    if (broken.length) {
      await Enrollment.deleteMany({ _id: { $in: broken.map((e) => e._id) } });
    }
    const valid = enrollments.filter((e) => e.courseId);
    const courseIds = valid.map((e) => e.courseId._id);

    // Fetch lesson counts for all courses in one query
    const lessonCounts = await Lesson.aggregate([
      { $match: { courseId: { $in: courseIds }, status: 'published' } },
      { $group: { _id: '$courseId', total: { $sum: 1 } } },
    ]);
    const lessonCountMap = {};
    lessonCounts.forEach((l) => { lessonCountMap[l._id.toString()] = l.total; });

    // Fetch StudentProgress for all courses in one query
    const progressDocs = await StudentProgress.find({ studentId, courseId: { $in: courseIds } }).lean();
    const progressMap = {};
    progressDocs.forEach((p) => { progressMap[p.courseId.toString()] = p; });

    const result = valid.map((enrollment) => {
      const courseIdStr  = enrollment.courseId._id.toString();
      const totalLessons = lessonCountMap[courseIdStr] || 0;
      const sp           = progressMap[courseIdStr];

      // ✅ Read completed lesson count from StudentProgress
      const completedLessons = sp?.completedLessons?.length || 0;
      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return {
        _id:              enrollment._id,
        course:           enrollment.courseId,
        enrolledAt:       enrollment.createdAt,
        progress,
        totalLessons,
        completedLessons,
        lastAccessed:     sp?.lastAccessedAt || enrollment.updatedAt,
      };
    });

    return res.status(200).json({ success: true, enrollments: result });
  } catch (err) {
    console.error('getEnrolledCourses error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching enrolled courses' });
  }
};

// ─── Dashboard stats (progress from StudentProgress) ────────────────────────
exports.getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId }).select('courseId');
    if (!enrollments.length) {
      return res.status(200).json({
        success: true,
        stats: { enrolledCourses: 0, completedCourses: 0, certificates: 0 },
      });
    }

    const broken = enrollments.filter((e) => !e.courseId);
    if (broken.length) {
      await Enrollment.deleteMany({ _id: { $in: broken.map((e) => e._id) } });
    }
    const valid      = enrollments.filter((e) => e.courseId);
    const enrolledCount = valid.length;
    const courseIds  = valid.map((e) => e.courseId);

    // Fetch lesson counts
    const lessonCounts = await Lesson.aggregate([
      { $match: { courseId: { $in: courseIds }, status: 'published' } },
      { $group: { _id: '$courseId', total: { $sum: 1 } } },
    ]);
    const lessonCountMap = {};
    lessonCounts.forEach((l) => { lessonCountMap[l._id.toString()] = l.total; });

    // Fetch all StudentProgress docs
    const progressDocs = await StudentProgress.find({ studentId, courseId: { $in: courseIds } }).lean();
    const progressMap  = {};
    progressDocs.forEach((p) => { progressMap[p.courseId.toString()] = p; });

    // Count completed courses
    let completedCount = 0;
    for (const e of valid) {
      const cid          = e.courseId.toString();
      const totalLessons = lessonCountMap[cid] || 0;
      const sp           = progressMap[cid];
      const done         = sp?.completedLessons?.length || 0;
      if (totalLessons > 0 && done >= totalLessons) completedCount++;
    }

    const certificatesCount = await Certificate.countDocuments({ studentId });

    return res.status(200).json({
      success: true,
      stats: {
        enrolledCourses:  enrolledCount,
        completedCourses: completedCount,
        certificates:     certificatesCount || 0,
      },
    });
  } catch (err) {
    console.error('getStudentDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

// ─── Available courses ───────────────────────────────────────────────────────
exports.getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses     = await Course.find({ status: 'published' }).select('title description price thumbnail');
    const enrollments = await Enrollment.find({ studentId }).select('courseId');
    const enrolledIds = enrollments.map((e) => e.courseId.toString());

    res.status(200).json({
      success: true,
      courses: courses.map((c) => ({ ...c.toObject(), isEnrolled: enrolledIds.includes(c._id.toString()) })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

// ─── Course details ──────────────────────────────────────────────────────────
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId    = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId).populate('createdBy', 'name email avatar').lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollment   = await Enrollment.findOne({ courseId, studentId });
    const totalLessons = await Lesson.countDocuments({ courseId, status: 'published' });
    const firstLesson  = enrollment
      ? await Lesson.findOne({ courseId }).sort('order').select('_id title')
      : null;

    res.status(200).json({
      success: true,
      course:  { ...course, isEnrolled: !!enrollment, totalLessons, firstLesson },
    });
  } catch (err) {
    console.error('getCourseDetails error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching course details' });
  }
};

// ─── Course lessons (isCompleted from StudentProgress) ──────────────────────
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId    = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Enroll in this course to view lessons' });
    }

    const lessons = await Lesson.find({ courseId })
      .sort('order')
      .select('_id title description lessonType order duration isPreview materials content');

    // ✅ Read from StudentProgress
    const sp = await StudentProgress.findOne({ studentId, courseId }).lean();
    const completedIds = (sp?.completedLessons || []).map((l) => l.lessonId.toString());

    res.status(200).json({
      success:          true,
      lessons:          lessons.map((l) => ({ ...l.toObject(), isCompleted: completedIds.includes(l._id.toString()) })),
      totalLessons:     lessons.length,
      completedLessons: completedIds.length,
    });
  } catch (err) {
    console.error('getCourseLessons error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching lessons' });
  }
};

// ─── Single lesson (isCompleted from StudentProgress) ───────────────────────
exports.getLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId              = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Enroll in this course to view this lesson' });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId }).select(
      '_id title description content lessonType materials order duration isPreview'
    );
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const allLessons    = await Lesson.find({ courseId }).sort('order').select('_id title');
    const currentIndex  = allLessons.findIndex((l) => l._id.toString() === lessonId);
    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson     = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    // ✅ Read from StudentProgress
    const sp          = await StudentProgress.findOne({ studentId, courseId }).lean();
    const isCompleted = (sp?.completedLessons || []).some((l) => l.lessonId.toString() === lessonId);

    const lessonData = lesson.toObject();
    if (Array.isArray(lessonData.materials)) {
      lessonData.materials = lessonData.materials.map((m) => ({
        _id:         m._id || m.id,
        name:        m.name || 'Untitled Material',
        url:         m.url  || '',
        type:        m.type || 'document',
        description: m.description || '',
      }));
    }

    res.status(200).json({
      success: true,
      lesson:  {
        ...lessonData,
        isCompleted,
        navigation: {
          currentIndex:  currentIndex + 1,
          totalLessons:  allLessons.length,
          previousLesson,
          nextLesson,
        },
      },
    });
  } catch (err) {
    console.error('getLesson error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching lesson' });
  }
};

// ─── Search courses ──────────────────────────────────────────────────────────
exports.getSearchCourse = async (req, res) => {
  try {
    const { q = '', limit = 20 } = req.query;

    const query = q.trim()
      ? { $or: [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }] }
      : {};

    const courses = await Course.find(query).limit(Number(limit)).select('title description category price thumbnail level rating');
    res.status(200).json({ success: true, totalCourses: courses.length, courses });
  } catch (err) {
    console.error('getSearchCourse error:', err);
    res.status(500).json({ success: false, message: 'Failed to search courses' });
  }
};