const Course = require('../models/courseModel');
const Lesson = require('../models/Lesson');
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


// Get all published courses (or draft courses if admin/tutor)
exports.getAllCourses = async (req, res) => {
  try {
    let filter = { status: 'published' };

    // If user is tutor/admin, they can see their draft courses
    if (req.user.role === 'tutor') {
      filter = {
        $or: [
          { status: 'published' },
          { createdBy: req.user._id },
          { status: 'draft', createdBy: req.user._id }
        ]
      };
    }
    else if (req.user.role === 'admin') {
      filter = {}; // Admin can see all courses
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

    // Find course first
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only creator can update
    if (course.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // If thumbnail is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Learnify_Thumbnails',
      });
      course.thumbnail = result.secure_url;
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'status'];
    allowedUpdates.forEach((field) => {
      if (req.body[field]) {
        course[field] = req.body[field];
      }
    });

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