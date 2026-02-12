const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { upload } = require("../middleware/upload");
const verifyLessonAccess = require("../middleware/lessonAccessMiddleware");

/* ===================================================
   INSTRUCTOR / ADMIN ROUTES
   =================================================== */

// Create Lesson
router.post(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("tutor"),
  upload.any(), // Supports materials[0][file] dynamic fields
  lessonController.createLesson
);

// Update Lesson
router.put(
  "/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  upload.any(),
  lessonController.updateLesson
);

// Delete Lesson
router.delete(
  "/:lessonId",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.deleteLesson
);

/* ===================================================
   STUDENT / ENROLLED USER ROUTES
   =================================================== */

// Get Single Lesson (with signed URLs if implemented)
router.get(
  "/:lessonId",
  isAuthenticated,
  verifyLessonAccess,
  lessonController.getLessonById
);

// Get All Lessons By Course
router.get(
  "/course/:courseId",
  isAuthenticated,
  lessonController.getLessonsByCourse
);
router.patch(
  "/reorder",
  isAuthenticated,
  authorizeRoles("tutor"),
  lessonController.reorderLessons
);

router.patch(
  "/:lessonId/progress",
  isAuthenticated,
  verifyLessonAccess,
  lessonController.updateProgress
);
module.exports = router;
