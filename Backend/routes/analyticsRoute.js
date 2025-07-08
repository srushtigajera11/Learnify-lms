const express = require('express');
const analyticsController = require('../controller/analyticsController');
const { isAuthenticated ,authorizeRoles} = require('../middleware/auth');
const router = express.Router();

router.get('/tutor/monthly-earnings', isAuthenticated, authorizeRoles('tutor'),analyticsController.getMonthlyEarnings);
router.get(
    "/tutor/stats",
    isAuthenticated,
    authorizeRoles("tutor"),
    analyticsController.getTutorStats
  );

  router.get(
    "/tutor/enrollments",
    isAuthenticated,
    authorizeRoles("tutor"),
    analyticsController.getTutorEnrollments
  );

  // routes/analytics.js
router.get('/tutor/earnings', isAuthenticated, authorizeRoles("tutor"), analyticsController.getTutorEarnings);

module.exports = router;