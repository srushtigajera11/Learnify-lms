
const express = require('express');
const router  = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const gamificationController = require('../controller/gamificationController');

const auth = [isAuthenticated, authorizeRoles('student', 'admin')];

router.get(
  '/:studentId/gamification',
  ...auth,
  gamificationController.getStudentGamificationStats
);

module.exports = router;