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

// In studentController.js - Fix the sorting
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find course with all details
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email')
      .populate('category', 'name');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // For students: check if enrolled
    if (userRole === 'student') {
      const isEnrolled = await Enrollment.findOne({ 
        courseId, 
        studentId: userId 
      });

      // If enrolled, return course with lessons
      if (isEnrolled) {
        const lessons = await Lesson.find({ 
          courseId, 
          status: 'published' 
        });
        
        // ✅ FIXED: Proper sorting
        const sortedLessons = lessons.sort((a, b) => a.order - b.order);
        
        return res.status(200).json({
          success: true,
          course: {
            ...course.toObject(),
            lessons: sortedLessons,
            isEnrolled: true
          }
        });
      }
      
      // If not enrolled but course is published, return basic details
      if (course.status === 'published') {
        const totalLessons = await Lesson.countDocuments({ courseId });
        
        return res.status(200).json({
          success: true,
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            price: course.price,
            level: course.level,
            category: course.category,
            createdBy: course.createdBy,
            status: course.status,
            rating: course.rating,
            totalLessons,
            isEnrolled: false
          }
        });
      }
    }

    // For instructors/admins
    if (userRole === 'tutor' || userRole === 'admin') {
      const lessons = await Lesson.find({ courseId });
      const sortedLessons = lessons.sort((a, b) => a.order - b.order); // ✅ Fixed
      
      return res.status(200).json({
        success: true,
        course: {
          ...course.toObject(),
          lessons: sortedLessons,
          canEdit: true
        }
      });
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this course'
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};