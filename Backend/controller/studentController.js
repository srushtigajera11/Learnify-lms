const Enrollment = require('../models/Enrollment');
const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');

exports.getAllCoursesForStudents = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' }).populate('createdBy', 'name');

    const coursesWithLessons = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = await Lesson.countDocuments({ courseId: course._id });
        return {
          ...course.toObject(),
          totalLessons,
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithLessons,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Course not found or unpublished' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ courseId, studentId });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Enroll student
    const enrollment = await Enrollment.create({ courseId, studentId });
    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all enrollments of the student
    const enrollments = await Enrollment.find({ studentId })
  .populate({
    path: 'courseId',
    select: 'title description createdBy thumbnail',
    populate: { path: 'createdBy', select: 'name' }  // <-- This populates instructor name
  })
  .populate('progress.lessonId', 'title');


    if (!enrollments.length) {
      return res.status(404).json({ success: false, message: 'No enrolled courses found' });
    }

       res.status(200).json({ success: true, enrollments });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};