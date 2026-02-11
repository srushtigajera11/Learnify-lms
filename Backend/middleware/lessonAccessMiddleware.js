const Lesson = require("../models/Lesson");
const Course = require("../models/courseModel");
const Enrollment = require("../models/Enrollment");

const verifyLessonAccess = async (req, res, next) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const course = await Course.findById(lesson.courseId);

    /* =============================
       1️⃣ ADMIN CAN ACCESS EVERYTHING
    ============================== */
    if (userRole === "admin") {
      return next();
    }

    /* =============================
       2️⃣ INSTRUCTOR CAN ACCESS OWN COURSE
    ============================== */
    if (
      userRole === "instructor" &&
      course.instructor.toString() === userId
    ) {
      return next();
    }

    /* =============================
       3️⃣ PREVIEW LESSON (PUBLIC ACCESS)
    ============================== */
    const isPreviewLesson = lesson.materials.some(
      (m) => m.isPreview === true
    );

    if (isPreviewLesson) {
      return next();
    }

    /* =============================
       4️⃣ STUDENT MUST BE ENROLLED
    ============================== */
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: lesson.courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    next();
  } catch (error) {
    console.error("Lesson Access Error:", error);
    res.status(500).json({
      success: false,
      message: "Access verification failed",
    });
  }
};

module.exports = verifyLessonAccess;
