// backend/src/controllers/admin.controller.js
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Course = require('../models/courseModel');
const Payment = require('../models/Payment');
const { Parser } = require('json2csv');

// Get Activity Logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    
    if (action) filter.action = action;
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('adminId', 'name email'),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Daily signups
    const dailySignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          role: 'student'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course status counts
    const courseStats = await Course.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Quick stats
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments({ status: 'published' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      data: {
        dailySignups,
        courseStats,
        quickStats: {
          totalUsers,
          totalInstructors,
          totalCourses,
          pendingCourses,
          totalRevenue: totalRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export Users CSV
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role status createdAt lastLogin')
      .lean();

    const transformed = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Status: user.status,
      'Created At': new Date(user.createdAt).toLocaleDateString(),
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    }));

    const parser = new Parser();
    const csv = parser.parse(transformed);

    res.header('Content-Type', 'text/csv');
    res.attachment(`users_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export Courses CSV
exports.exportCoursesCSV = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .select('title instructor price status enrollmentCount createdAt')
      .lean();

    const transformed = courses.map(course => ({
      Title: course.title,
      Instructor: course.instructor?.name || 'Unknown',
      'Instructor Email': course.instructor?.email || 'N/A',
      Price: `$${course.price}`,
      Status: course.status,
      Enrollments: course.enrollmentCount || 0,
      'Created At': new Date(course.createdAt).toLocaleDateString()
    }));

    const parser = new Parser();
    const csv = parser.parse(transformed);

    res.header('Content-Type', 'text/csv');
    res.attachment(`courses_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};