const express = require("express");
const router = express.Router();
const lessonController = require("../controller/lessonController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const verifyLessonAccess = require("../middleware/lessonAccessMiddleware");

/* ===================================================
   INSTRUCTOR / ADMIN ROUTES
   =================================================== */

// ✅ Create Lesson
router.post(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("tutor"),
  upload.any(),
  lessonController.createLesson
);

// ✅ Get All Lessons By Course (MOVE ABOVE :lessonId)
router.get(
  "/course/:courseId",
  isAuthenticated,
  lessonController.getLessonsByCourse
);

// ✅ Reorder Lessons (Specific route before dynamic)
router.patch(
  "/reorder",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.reorderLessons
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

// ✅ Update Progress (must come before get single)
router.patch(
  "/:lessonId/progress",
  isAuthenticated, authorizeRoles("tutor"),
  lessonController.updateProgress
);

// ✅ Get Single Lesson (KEEP THIS LAST)
router.get(
  "/:lessonId",
  isAuthenticated, authorizeRoles("tutor"),
  lessonController.getLessonById
);

module.exports = router;
