const express = require('express');
const router = express.Router();
const { authorizeRoles, isAuthenticated } = require('../middleware/auth');
const {
  createUserProfile,
  getUserProfile,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  signup,
  changePassword,
  verifyEmail
} = require('../controller/userController');

// AUTH ROUTES
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// PROFILE ROUTES
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.put('/change-password', isAuthenticated, changePassword);

// DASHBOARDS
router.get('/student-dashboard', authorizeRoles('student'), (req, res) => {
  res.json({ message: 'Welcome Student', user: req.user });
});

router.get('/tutor-dashboard', authorizeRoles('tutor'), (req, res) => {
  res.json({ message: 'Welcome Tutor', user: req.user });
});

// USER BY ID (⚠️ ALWAYS LAST)
router.get('/:id', getUserProfile);

module.exports = router;
