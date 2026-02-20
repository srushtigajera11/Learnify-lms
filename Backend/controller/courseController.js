const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');

const cloudinary = require('../utils/cloudinary');
// Create a new course (Tutor only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const thumbnailUrl = req.file?.path || req.file?.url || null;
    
    const newCourse = new Course({
      title,
      description,
      category,
      price,
      status: status || 'draft',
      thumbnail: thumbnailUrl, // direct from multer-cloudinary upload
      createdBy: req.user.id,
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// backend/src/controllers/courseController.js - Add this method
exports.getCourseStats = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Run queries in parallel (efficient)
    const [
      lessons,
      totalQuizzes,
      totalStudents
    ] = await Promise.all([
      Lesson.find({ courseId }),
      Quiz.countDocuments({ courseId }),
      Enrollment.countDocuments({ courseId })
    ]);

    const totalLessons = lessons.length;

    const totalDuration = lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    );

    const totalSections = course.sections?.length || 0;

    // Completion logic
    const checks = [
      course.title && course.title.length >= 10,
      course.description && course.description.length >= 50,
      course.category,
      course.thumbnail,
      totalSections >= 1,
      totalLessons >= 1,
      course.price !== undefined,
    ];

    const completeness = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );

    res.status(200).json({
      success: true,
      stats: {
        totalLessons,
        totalDuration,
        totalSections,
        totalQuizzes,
        totalStudents,   // ✅ Enrollment based
        completeness,
      },
    });

  } catch (error) {
    console.error('Get Course Stats Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper functions
const calculateCompleteness = (course) => {
  const checks = [
    !!course.title && course.title.length >= 10,
    !!course.description && course.description.length >= 50,
    !!course.category,
    !!course.thumbnail,
    course.sections?.length >= 1,
    course.totalLessons >= 1,
    course.price !== undefined
  ];
  
  const met = checks.filter(Boolean).length;
  return Math.round((met / checks.length) * 100);
};

const getMissingItems = (course) => {
  const missing = [];
  
  if (!course.title || course.title.length < 10) {
    missing.push('Course title is too short (min 10 characters)');
  }
  
  if (!course.description || course.description.length < 50) {
    missing.push('Course description is too short (min 50 characters)');
  }
  
  if (!course.category) {
    missing.push('Category not selected');
  }
  
  if (!course.thumbnail) {
    missing.push('Course thumbnail missing');
  }
  
  if (!course.sections || course.sections.length === 0) {
    missing.push('No sections created');
  }
  
  if (course.totalLessons === 0) {
    missing.push('No lessons added');
  }
  
  if (course.price === undefined) {
    missing.push('Price not set');
  }
  
  return missing;
};
// GET /api/courses/mine
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id }).populate('createdBy', 'name email');
    res.json(courses);
  } catch (error) {
    console.error('Get My Courses Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyCourseById = async (req, res) => {
  try {
    console.log("Requested Course ID:", req.params.id);
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('createdBy', 'name email');
      // .populate('enrolledStudents', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (error) {
    console.error('Get My Course Detail Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// In getAllCourses - fix the user reference
exports.getAllCourses = async (req, res) => {
  try {
    let filter = { status: 'published' };

    if (req.user.role === 'tutor') {
      filter = {
        $or: [
          { status: 'published' },
          { createdBy: req.user.id }, // ✅ FIXED: req.user.id instead of req.user._id
        ]
      };
    }
    else if (req.user.role === 'admin') {
      filter = {};
    }

    const courses = await Course.find(filter).populate('createdBy', 'name email');
    res.json(courses);
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('Get Course By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update course by ID (Tutor only)
exports.updateMyCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only creator can update
    if (course.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // If thumbnail is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Learnify_Thumbnails',
      });
      course.thumbnail = result.secure_url;
    }

    // Update fields
    const { title, description, status, category, price, objectives, requirements, level } = req.body;

    // Only allow certain status transitions
    if (status && status !== course.status) {
      const allowedTransitions = {
        'draft': ['pending'],
        'rejected': ['draft']
      };

      if (allowedTransitions[course.status] && 
          allowedTransitions[course.status].includes(status)) {
        course.status = status;
        if (status === 'pending') {
          course.submittedAt = new Date();
        }
        if (status === 'draft' && course.status === 'rejected') {
          course.adminFeedback = ''; // Clear feedback when resubmitting
        }
      }
    }

    // Update other fields
    course.title = title !== undefined ? title : course.title;
    course.description = description !== undefined ? description : course.description;
    course.category = category !== undefined ? category : course.category;
    course.price = price !== undefined ? parseFloat(price) : course.price;
    
    if (objectives !== undefined) {
      course.objectives = Array.isArray(objectives) ? objectives : 
                         objectives.split(',').map(obj => obj.trim());
    }
    
    if (requirements !== undefined) {
      course.requirements = Array.isArray(requirements) ? requirements : 
                           requirements.split(',').map(req => req.trim());
    }
    
    course.level = level !== undefined ? level : course.level;

    await course.save();
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete course by ID (Tutor only)
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

    res.status(200).json({ course, lessons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Submit course for admin review (Tutor)
exports.submitForReview = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Validate course can be submitted
    if (course.status !== 'draft') {
      return res.status(400).json({ 
        message: `Course is already ${course.status}. Only draft courses can be submitted.` 
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !course[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    if (!course.thumbnail) {
      return res.status(400).json({ 
        message: 'Course thumbnail is required' 
      });
    }

    // Update course status
    course.status = 'pending';
    course.submittedAt = new Date();
    await course.save();

    // TODO: Send notification to admin (implement later)
    // sendNotificationToAdmins({
    //   type: 'COURSE_SUBMITTED',
    //   courseId: course._id,
    //   tutorName: req.user.name,
    //   courseTitle: course.title
    // });

    res.status(200).json({ 
      message: 'Course submitted for admin approval', 
      course 
    });
  } catch (error) {
    console.error('Submit for Review Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update course status (Tutor - fix rejected course)
exports.updateCourseStatus = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course creator
    if (course.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Validate status transition
    const allowedTransitions = {
      'rejected': ['draft'], // Rejected can only go back to draft
      'draft': ['pending', 'draft'], // Draft can be submitted or stay draft
    };

    if (!allowedTransitions[course.status] || 
        !allowedTransitions[course.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${course.status} to ${status}` 
      });
    }

    // If moving from rejected to draft, clear admin feedback
    if (course.status === 'rejected' && status === 'draft') {
      course.adminFeedback = '';
    }

    course.status = status;
    if (status === 'pending') {
      course.submittedAt = new Date();
    }
    
    await course.save();

    res.status(200).json({ 
      message: `Course status updated to ${status}`, 
      course 
    });
  } catch (error) {
    console.error('Update Course Status Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get tutor dashboard stats
exports.getTutorStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const courses = await Course.find({ createdBy: userId });
    
    const stats = {
      total: courses.length,
      draft: courses.filter(c => c.status === 'draft').length,
      pending: courses.filter(c => c.status === 'pending').length,
      published: courses.filter(c => c.status === 'published').length,
      rejected: courses.filter(c => c.status === 'rejected').length,
      totalRevenue: 0, // Calculate from enrollments
      totalStudents: 0, // Calculate from enrollments
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get Tutor Stats Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get courses by status filter (Tutor)
exports.getCoursesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    
    const filter = { createdBy: userId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const courses = await Course.find(filter)
      .sort('-createdAt')
      .populate('createdBy', 'name email');
    
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get Courses by Status Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ============================================
// ADMIN FUNCTIONS (Create separate adminController if needed)
// ============================================

// Get all pending courses (Admin)
exports.getPendingCourses = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const pendingCourses = await Course.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort('-submittedAt');

    res.status(200).json(pendingCourses);
  } catch (error) {
    console.error('Get Pending Courses Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Approve course (Admin)
exports.approveCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending') {
      return res.status(400).json({ 
        message: `Course is ${course.status}, only pending courses can be approved` 
      });
    }

    course.status = 'published';
    course.approvedAt = new Date();
    course.adminFeedback = ''; // Clear any previous rejection feedback
    await course.save();

    // TODO: Send notification to tutor
    // sendNotificationToUser(course.createdBy, {
    //   type: 'COURSE_APPROVED',
    //   courseId: course._id,
    //   courseTitle: course.title
    // });

    res.status(200).json({ 
      message: 'Course approved and published successfully', 
      course 
    });
  } catch (error) {
    console.error('Approve Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reject course (Admin)
exports.rejectCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const courseId = req.params.id;
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ message: 'Rejection feedback is required' });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending') {
      return res.status(400).json({ 
        message: `Course is ${course.status}, only pending courses can be rejected` 
      });
    }

    course.status = 'rejected';
    course.adminFeedback = feedback.trim();
    await course.save();

    // TODO: Send notification to tutor
    // sendNotificationToUser(course.createdBy, {
    //   type: 'COURSE_REJECTED',
    //   courseId: course._id,
    //   courseTitle: course.title,
    //   feedback: feedback
    // });

    res.status(200).json({ 
      message: 'Course rejected successfully', 
      course 
    });
  } catch (error) {
    console.error('Reject Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get admin dashboard stats
exports.getAdminDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all counts
    const [totalCourses, pendingCourses, totalUsers, totalEnrollments, totalPayments] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'pending' }),
      // Add your User model import and count
      // User.countDocuments(),
      // Enrollment.countDocuments(),
      // Payment.countDocuments(),
    ]);

    const stats = {
      totalCourses,
      pendingCourses,
      totalUsers: totalUsers || 0,
      totalEnrollments: totalEnrollments || 0,
      totalPayments: totalPayments || 0,
      // Add revenue calculation if you have payments
      // totalRevenue: await Payment.aggregate([...])
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};