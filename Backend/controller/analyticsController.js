
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

exports.getMonthlyEarnings = async(req,res)=>{
    try{
        const tutorId = req.user.id;
       const earnings = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      { $match: { "course.createdBy": new mongoose.Types.ObjectId(tutorId) } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalEarnings: { $sum: "$course.price" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const formatted = earnings.map(item => ({
        month : `${monthNames[item._id.month]} ${item._id.year}`,
        earnings: item.totalEarnings,
    }));

    res.status(200).json({
        success: true,
        formatted,
    });

    }
    catch(err){
        console.error("Error fetching monthly earnings:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

exports.getTutorStats = async (req, res) => {
  try {
    const tutorId = req.user.id;

    // Get all courses created by this tutor
    const courses = await Course.find({ createdBy: tutorId });
    const courseIds = courses.map((course) => course._id);

    const totalCourses = courses.length;

    // Total number of students enrolled across all tutor courses
    const totalEnrollments = await Enrollment.countDocuments({
      courseId: { $in: courseIds },
    });

    // Count pending (draft) courses
    const pendingApprovals = await Course.countDocuments({
      createdBy: tutorId,
      status: "draft",
    });

    // ✅ Lifetime total earnings (no date filter)
    const totalEarningsAgg = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.createdBy": new mongoose.Types.ObjectId(tutorId),
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$course.price" },
        },
      },
    ]);

    const lifetimeEarnings = totalEarningsAgg[0]?.totalEarnings || 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalEnrollments,
        pendingApprovals,
        monthlyEarnings: lifetimeEarnings, // 👈 keep same key for frontend compatibility
      },
    });
  } catch (err) {
    console.error("Error fetching tutor analytics:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Example controller for /tutor/enrollments
exports.getTutorEnrollments = async (req, res) => {
  try {
    console.log('➡️ Entered getTutorEnrollments');

    // Confirm req.user.id is defined
    if (!req.user || !req.user.id) {
      
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const tutorId = new mongoose.Types.ObjectId(req.user.id);
    const courses = await Course.find({ createdBy: tutorId })

    if (courses.length === 0) {
      return res.status(200).json({ success: true, enrollments: [] });
    }

    const courseIds = courses.map(c => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    res.status(200).json({ success: true, enrollments });
  } catch (error) {
    console.error('❗ Error in getTutorEnrollments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// controllers/analyticsController.js

exports.getTutorEarnings = async (req, res) => {
  try {
    const tutorId = req.user.id;

    // Get courses created by this tutor
    const courses = await Course.find({ createdBy: tutorId });
    const courseIds = courses.map(course => course._id);

    // Get enrollments with course info
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title price') // price comes from here
      .populate('studentId', 'name email');

    // Group earnings by course
    const earningsByCourse = {};

    enrollments.forEach(enroll => {
      const courseId = enroll.courseId._id.toString();
      const courseTitle = enroll.courseId.title;
      const price = enroll.courseId.price || 0;

      if (!earningsByCourse[courseId]) {
        earningsByCourse[courseId] = {
          courseId,
          courseTitle,
          students: 0,
          totalEarnings: 0,
        };
      }

      earningsByCourse[courseId].students += 1;
      earningsByCourse[courseId].totalEarnings += price;
    });

    const earningsList = Object.values(earningsByCourse);
const totalEarnings = earningsList.reduce((sum, item) => sum + item.totalEarnings, 0);

   res.status(200).json({
  success: true,
  totalEarnings,
  earningsList,
});
  } catch (err) {
    console.error('Error fetching earnings:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

