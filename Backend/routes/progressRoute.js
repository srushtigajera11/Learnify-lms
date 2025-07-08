// routes/progressRoutes.js
const express = require('express');
const { markLessonCompleted, getProgress } = require('../controller/progressController');
const {isAuthenticated , authorizeRoles} = require('../middleware/auth');

const router = express.Router();

router.post('/:courseId/:lessonId', isAuthenticated, authorizeRoles('student'), markLessonCompleted);
router.get('/:courseId', isAuthenticated, authorizeRoles('student'), getProgress);

module.exports = router;
