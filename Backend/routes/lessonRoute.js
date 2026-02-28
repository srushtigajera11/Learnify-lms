const express = require("express");
const router = express.Router();
const lessonController = require("../controller/lessonController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

/* ===================================================
   MULTER CONFIGURATION FOR LESSONS
   =================================================== */

// Configure multer to accept up to 10 material files
const uploadLessonMaterials = upload.fields([
  { name: 'materials[0][file]', maxCount: 1 },
  { name: 'materials[1][file]', maxCount: 1 },
  { name: 'materials[2][file]', maxCount: 1 },
  { name: 'materials[3][file]', maxCount: 1 },
  { name: 'materials[4][file]', maxCount: 1 },
  { name: 'materials[5][file]', maxCount: 1 },
  { name: 'materials[6][file]', maxCount: 1 },
  { name: 'materials[7][file]', maxCount: 1 },
  { name: 'materials[8][file]', maxCount: 1 },
  { name: 'materials[9][file]', maxCount: 1 },
]);

/* ===================================================
   TUTOR / ADMIN ROUTES
   =================================================== */

// ✅ Create Lesson
router.post(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("tutor"),
  uploadLessonMaterials,
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
  uploadLessonMaterials,
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