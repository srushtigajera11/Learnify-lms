// controller/progressController.js
const UserProgress = require('../models/UserProgress');
const Course = require('../models/courseModel');
const mongoose = require("mongoose");
const Lesson = require('../models/Lesson');

// Mark lesson as completed
exports.markLessonCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lessonId } = req.params;
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is missing"
      });
    }
     if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Lesson ID"
      });
    }

    // Get the lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lesson not found' 
      });
    }

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId, courseId });
    
    if (!userProgress) {
      // Create new progress entry
      const totalLessons = await Lesson.countDocuments({ courseId });
      userProgress = await UserProgress.create({
        userId,
        courseId,
        totalLessons,
        completedLessons: [{ lessonId, completedAt: new Date() }],
        progressPercentage: calculateProgress(1, totalLessons)
      });
    } else {
      // Check if already completed
      const alreadyCompleted = userProgress.completedLessons.some(
        cl => cl.lessonId.toString() === lessonId
      );
      
      if (!alreadyCompleted) {
        // Add to completed lessons
        userProgress.completedLessons.push({
          lessonId,
          completedAt: new Date()
        });
        
        // Update progress
        const totalLessons = userProgress.totalLessons || await Lesson.countDocuments({ courseId });
        const completedCount = userProgress.completedLessons.length;
        
        userProgress.progressPercentage = calculateProgress(completedCount, totalLessons);
        
        // Check if course is completed
        if (completedCount >= totalLessons) {
          userProgress.isCompleted = true;
          userProgress.completedAt = new Date();
        }
        
        await userProgress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      progress: userProgress
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Get course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    let userProgress = await UserProgress.findOne({ userId, courseId })
      .populate('completedLessons.lessonId', 'title lessonType order duration')
      .populate('certificateId');

    if (!userProgress) {
      // If no progress exists, create one with 0 progress
      const totalLessons = await Lesson.countDocuments({ courseId });
      userProgress = {
        userId,
        courseId,
        totalLessons,
        completedLessons: [],
        progressPercentage: 0,
        isCompleted: false,
        averageScore: 0,
        quizResults: []
      };
    }

    res.status(200).json({
      success: true,
      progress: userProgress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Get all enrolled courses progress
exports.getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progresses = await UserProgress.find({ userId })
      .populate('courseId', 'title thumbnail description instructor')
      .populate('completedLessons.lessonId', 'title')
      .sort('-updatedAt');

    // Calculate statistics
    const stats = {
      totalCourses: progresses.length,
      completedCourses: progresses.filter(p => p.isCompleted).length,
      inProgressCourses: progresses.filter(p => !p.isCompleted && p.progressPercentage > 0).length,
      notStartedCourses: progresses.filter(p => p.progressPercentage === 0).length,
      totalTimeSpent: progresses.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      averageProgress: progresses.reduce((sum, p) => sum + p.progressPercentage, 0) / (progresses.length || 1)
    };

    res.status(200).json({
      success: true,
      progresses,
      stats
    });
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Update quiz score
exports.updateQuizScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { score, quizId, maxScore } = req.body;

    let userProgress = await UserProgress.findOne({ userId, courseId });
    
    if (!userProgress) {
      // Create progress if doesn't exist
      const totalLessons = await Lesson.countDocuments({ courseId });
      userProgress = await UserProgress.create({
        userId,
        courseId,
        totalLessons,
        quizResults: [{ quizId, score, maxScore, takenAt: new Date() }],
        averageScore: score
      });
    } else {
      // Add quiz result
      userProgress.quizResults.push({
        quizId,
        score,
        maxScore,
        takenAt: new Date()
      });
      
      // Recalculate average score
      const totalQuizzes = userProgress.quizResults.length;
      const totalScore = userProgress.quizResults.reduce((sum, q) => sum + q.score, 0);
      userProgress.averageScore = totalScore / totalQuizzes;
      
      await userProgress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Quiz score updated',
      averageScore: userProgress.averageScore
    });
  } catch (error) {
    console.error('Error updating quiz score:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Calculate progress percentage
const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};