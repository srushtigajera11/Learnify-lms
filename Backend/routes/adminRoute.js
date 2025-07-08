// routes/admin.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const Course = require('../models/courseModel');
const User = require('../models/User');

// Get all courses
router.get('/courses', isAuthenticated, isAdmin, async (req, res) => {
  console.log("Authenticated User:", req.user);  // 👈 Debug
  const courses = await Course.find().populate('createdBy', 'name email');
  res.json(courses);
});

// Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Toggle course visibility
router.put('/course/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.status = req.body.status || 'draft';
  await course.save();
  res.json({ message: 'Status updated', course });
});

module.exports = router;
