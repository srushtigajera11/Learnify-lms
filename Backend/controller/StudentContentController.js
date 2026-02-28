const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');
const Gamification = require('../models/Gamification');
const Certificate = require('../models/Certificate');
const QuizResult = require('../models/QuizResult');

/**
 * Get unified course content (lessons + quizzes + certificate) for student
 * Returns ordered list of all course content items
 */
exports.getUnifiedCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check enrollment
    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course to view content'
      });
    }

    // Get course details
    const course = await Course.findById(courseId)
      .select('title description thumbnail')
      .populate('createdBy', 'name');

    // Get all lessons
    const lessons = await Lesson.find({ 
      courseId,
      status: 'published'
    }).sort('order').lean();

    // Get all published quizzes
    const quizzes = await Quiz.find({
      courseId,
      isPublished: true
    }).sort('order').lean();

    // Get gamification data
    let gamification = await Gamification.findOne({ studentId, courseId });
    if (!gamification) {
      gamification = await Gamification.create({ 
        studentId, 
        courseId,
        totalXp: 0,
        level: 1
      });
    }

    // Get quiz results for this student
    const quizResults = await QuizResult.find({
      studentId,
      courseId
    }).lean();

    // Check for certificate
    const certificate = await Certificate.findOne({
      studentId,
      courseId,
      status: 'active'
    });

    // Combine and sort by order
    const contentItems = [];

    // Add lessons
    lessons.forEach(lesson => {
      contentItems.push({
        _id: lesson._id,
        type: 'lesson',
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.totalDuration || 0,
        isCompleted: enrollment.completedLessons?.includes(lesson._id.toString()) || false,
        lessonType: lesson.lessonType
      });
    });

    // Add quizzes
    quizzes.forEach(quiz => {
      const studentQuizResults = quizResults.filter(
        r => r.quizId.toString() === quiz._id.toString()
      );
      
      const bestAttempt = studentQuizResults.length > 0
        ? studentQuizResults.reduce((best, current) => 
            current.score > best.score ? current : best
          )
        : null;
      
      contentItems.push({
        _id: quiz._id,
        type: 'quiz',
        title: quiz.title,
        description: quiz.description,
        order: quiz.order,
        duration: quiz.timeLimit || 0,
        isCompleted: bestAttempt && bestAttempt.passed,
        quizType: quiz.quizType,
        xpReward: quiz.xpReward,
        generatesCertificate: quiz.generatesCertificate,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        attempts: studentQuizResults.length,
        bestScore: bestAttempt?.score || 0
      });
    });

    // Sort by order
    contentItems.sort((a, b) => a.order - b.order);

    // Calculate completion
    const totalItems = contentItems.length;
    const completedItems = contentItems.filter(item => item.isCompleted).length;
    const completionPercentage = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100) 
      : 0;

    // Check if certificate should be unlocked (all content complete + final quiz passed)
    const finalQuizPassed = quizzes.some(quiz => {
      if (!quiz.generatesCertificate) return false;
      const results = quizResults.filter(r => r.quizId.toString() === quiz._id.toString());
      return results.some(r => r.passed);
    });

    const allContentComplete = completedItems === totalItems;
    const certificateUnlocked = finalQuizPassed && allContentComplete;

    // Add certificate item at the end
    const maxOrder = contentItems.length > 0 
      ? Math.max(...contentItems.map(item => item.order)) 
      : 0;

    contentItems.push({
      _id: certificate?._id || 'certificate',
      type: 'certificate',
      title: 'Certificate of Completion',
      description: 'Claim your certificate',
      order: maxOrder + 1,
      duration: 0,
      isCompleted: !!certificate,
      isLocked: !certificateUnlocked,
      certificate: certificate || null,
      certificateId: certificate?.certificateId || null
    });

    res.status(200).json({
      success: true,
      course,
      content: contentItems,
      progress: {
        totalXP: gamification.totalXp,
        level: gamification.level,
        progressToNextLevel: gamification.progressToNextLevel,
        currentStreak: gamification.currentStreak,
        completedItems,
        totalItems: totalItems + 1, // Include certificate in total
        completionPercentage,
        certificateIssued: !!certificate,
        certificate: certificate || null
      }
    });

  } catch (error) {
    console.error('Get unified content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course content'
    });
  }
};

/**
 * Get specific lesson content
 */
exports.getLessonContent = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      courseId
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Get progress from enrollment
    const isCompleted = enrollment.completedLessons?.includes(lessonId) || false;

    res.status(200).json({
      success: true,
      lesson: {
        ...lesson.toObject(),
        isCompleted
      }
    });

  } catch (error) {
    console.error('Get lesson content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get specific quiz content
 */
exports.getQuizContent = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      courseId,
      isPublished: true
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get previous attempts
    const quizResults = await QuizResult.find({
      studentId,
      quizId
    }).sort('-attemptNumber');

    const attempts = quizResults.length;
    const bestAttempt = quizResults.length > 0
      ? quizResults.reduce((best, current) => 
          current.score > best.score ? current : best
        )
      : null;

    const canAttempt = attempts < quiz.maxAttempts;

    res.status(200).json({
      success: true,
      quiz: {
        ...quiz.toObject(),
        attempts,
        bestScore: bestAttempt?.score || 0,
        canAttempt,
        canAttemptReason: canAttempt ? '' : 'Maximum attempts reached'
      }
    });

  } catch (error) {
    console.error('Get quiz content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Mark lesson as complete
 */
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if lesson exists
    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Add to completed lessons if not already completed
    if (!enrollment.completedLessons) {
      enrollment.completedLessons = [];
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      await enrollment.save();

      // Update gamification (streak, optional XP for lesson completion)
      let gamification = await Gamification.findOne({ studentId, courseId });
      if (!gamification) {
        gamification = await Gamification.create({ studentId, courseId });
      }
      
      // Update streak on any activity
      gamification.updateStreak();
      await gamification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete'
    });

  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Submit quiz attempt
 */
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { answers } = req.body; // { questionId: optionId }
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get previous attempts
    const previousAttempts = await QuizResult.find({
      studentId,
      quizId
    }).sort('-attemptNumber');

    const attemptNumber = previousAttempts.length > 0 
      ? previousAttempts[0].attemptNumber + 1 
      : 1;

    // Check if can attempt
    if (attemptNumber > quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    // Grade answers
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedAnswers = quiz.questions.map(question => {
      totalPoints += question.points;
      const studentAnswer = answers[question._id];
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = studentAnswer === correctOption._id.toString();

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId: question._id,
        selectedOption: studentAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Create quiz result
    const quizResult = await QuizResult.create({
      studentId,
      quizId,
      courseId,
      attemptNumber,
      answers: gradedAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      score,
      passed,
      timeSpent: 0, // Can be calculated from startedAt/completedAt
      startedAt: new Date(),
      completedAt: new Date()
    });

    // Update gamification
    let gamification = await Gamification.findOne({ studentId, courseId });
    if (!gamification) {
      gamification = await Gamification.create({ studentId, courseId });
    }

    // Award XP if passed and first time (practice quizzes only)
    let xpEarned = 0;
    if (passed && attemptNumber === 1 && quiz.xpReward > 0) {
      await gamification.addXp(quiz.xpReward, 'quiz_completion');
      xpEarned = quiz.xpReward;
      quizResult.xpEarned = xpEarned;
      await quizResult.save();
    } else {
      gamification.updateStreak();
      await gamification.save();
    }

    // Check for certificate generation (final quiz)
    let certificateGenerated = false;
    let certificate = null;

    if (quiz.generatesCertificate && passed) {
      // Check if all content is completed
      const enrollment = await Enrollment.findOne({ studentId, courseId });
      const allLessonsCount = await Lesson.countDocuments({ 
        courseId, 
        status: 'published' 
      });
      const allQuizzesCount = await Quiz.countDocuments({ 
        courseId, 
        isPublished: true 
      });
      const totalContent = allLessonsCount + allQuizzesCount;

      const completedLessons = enrollment?.completedLessons?.length || 0;
      const passedQuizzes = await QuizResult.countDocuments({
        studentId,
        courseId,
        passed: true
      });

      const completedContent = completedLessons + passedQuizzes;

      // Check if certificate already exists
      let existingCertificate = await Certificate.findOne({
        studentId,
        courseId
      });

      if (completedContent >= totalContent && !existingCertificate) {
        // Generate certificate
        const course = await Course.findById(courseId);
        
        certificate = await Certificate.create({
          studentId,
          courseId,
          title: `Certificate of Completion - ${course.title}`,
          finalScore: score,
          completionDate: new Date(),
          quizResultId: quizResult._id,
          issuedBy: course.createdBy,
          status: 'active'
        });

        certificateGenerated = true;
        quizResult.certificateIssued = true;
        await quizResult.save();

        // Award certificate badge
        await gamification.addBadge({
          badgeName: 'Course Completed',
          badgeType: 'completion',
          badgeIcon: '🏆',
          description: `Completed ${course.title}`,
          xpReward: 50
        });
      }
    }

    res.status(200).json({
      success: true,
      result: {
        score,
        passed,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        earnedPoints,
        totalPoints,
        attemptNumber,
        xpEarned,
        certificateGenerated,
        certificate,
        answers: gradedAnswers
      }
    });

  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

