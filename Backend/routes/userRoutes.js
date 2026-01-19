
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
  changePassword
} = require('../controller/userController');


// Routes
router.post('/register', createUserProfile);
router.post('/signup',signup)
router.post('/login', loginUser);
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.put('/change-password', isAuthenticated, changePassword);

router.get('/:id',getUserProfile);

router.get('/student-dashboard', authorizeRoles('student'), (req, res) => {
  res.json({ message: 'Welcome Student', user: req.user });
});

router.get('/tutor-dashboard', authorizeRoles('tutor'), (req, res) => {
  res.json({ message: 'Welcome Tutor', user: req.user });
});


router.post('/logout', logoutUser);

module.exports = router;
