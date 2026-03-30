const express = require('express');
const router = express.Router();
const { authorizeRoles, isAuthenticated,isBlocked } = require('../middleware/auth');
const {
  createUserProfile,
  getUserProfile,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controller/userController');

// AUTH ROUTES
router.post('/register', createUserProfile);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// PROFILE ROUTES
router.get('/profile', isAuthenticated, isBlocked, getProfile);
router.put('/profile', isAuthenticated, isBlocked, updateProfile);
router.put('/change-password', isAuthenticated, isBlocked, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

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
