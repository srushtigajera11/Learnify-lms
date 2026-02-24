const express = require("express");
const router = express.Router();
const lessonController = require("../controller/lessonController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

/* ===================================================
   TUTOR / ADMIN ROUTES
   =================================================== */

// ✅ Create Lesson
router.post(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("tutor"),
  upload.any(),
  lessonController.createLesson
);

// ✅ Get All Lessons By Course
router.get(
  "/course/:courseId",
  isAuthenticated,
  lessonController.getLessonsByCourse
);

// ✅ Reorder Lessons
router.patch(
  "/reorder",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.reorderLessons
);

// ✅ TUTOR PREVIEW - Get lesson with all materials for preview
router.get(
  "/preview/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.getTutorLessonPreview
);

// ✅ Update Lesson
router.put(
  "/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  upload.any(),
  lessonController.updateLesson
);

// ✅ Delete Lesson
router.delete(
  "/lesson/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.deleteLesson
);

// ✅ Update Progress
router.patch(
  "/:lessonId/progress",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.updateProgress
);

// ✅ Get Single Lesson (KEEP THIS LAST)
router.get(
  "/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.getLessonById
);

module.exports = router;