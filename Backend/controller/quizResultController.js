const asyncHandler = require('express-async-handler');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Gamification = require('../models/Gamification');

// @desc    Submit quiz attempt
// @route   POST /api/quiz-results/quiz/:quizId/attempt
// @access  Private/Student
exports.submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeSpent } = req.body;

  // Find the quiz
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  if (!quiz.isPublished) {
    res.status(403);
    throw new Error('Quiz is not available');
  }

  // Check if student can attempt (max attempts)
  const previousAttempts = await QuizResult.countDocuments({
    studentId: req.user.id,
    quizId
  });

  if (previousAttempts >= quiz.maxAttempts) {
    res.status(400);
    throw new Error('Maximum attempts reached for this quiz');
  }

  // Calculate score and check answers
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const evaluatedAnswers = answers.map(answer => {
    const question = quiz.questions.id(answer.questionId);
    if (!question) return null;

    let isCorrect = false;
    let pointsEarned = 0;

    if (question.questionType === 'multiple-choice') {
      const selectedOption = question.options.id(answer.selectedOption);
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
    } else if (question.questionType === 'true-false') {
      const selectedOption = question.options.id(answer.selectedOption);
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
    } else if (question.questionType === 'short-answer') {
      isCorrect = question.correctAnswer.toLowerCase() === answer.textAnswer.toLowerCase();
    }

    pointsEarned = isCorrect ? question.points : 0;
    correctAnswers += isCorrect ? 1 : 0;
    earnedPoints += pointsEarned;
    totalPoints += question.points;

    return {
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      textAnswer: answer.textAnswer,
      isCorrect,
      pointsEarned
    };
  }).filter(Boolean);

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= quiz.passingScore;

  // Create quiz result
  const quizResult = await QuizResult.create({
    studentId: req.user.id,
    quizId,
    courseId: quiz.courseId,
    attemptNumber: previousAttempts + 1,
    answers: evaluatedAnswers,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    score,
    passed,
    timeSpent,
    startedAt: new Date(Date.now() - timeSpent * 60000), // Assuming timeSpent is in minutes
    completedAt: new Date()
  });

  // TODO: Add XP reward logic here (we'll implement in gamification phase)
  if (passed && quiz.xpReward > 0) {
    console.log(`Student would earn ${quiz.xpReward} XP for passing`);
    // We'll implement this in gamification phase
  }

  res.status(201).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: quizResult
  });
});

// @desc    Get quiz results for a student
// @route   GET /api/quiz-results/quiz/:quizId
// @access  Private/Student
exports.getStudentQuizResults = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const results = await QuizResult.find({
    studentId: req.user.id,
    quizId
  }).sort({ attemptNumber: 1 });

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Get quiz results for a tutor (all students)
// @route   GET /api/quiz-results/quiz/:quizId/tutor
// @access  Private/Tutor
exports.getQuizResultsForTutor = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  // Verify the tutor owns this quiz
  const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user.id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or access denied');
  }

  const results = await QuizResult.find({ quizId })
    .populate('studentId', 'name email')
    .sort({ score: -1 });

  // Calculate statistics
  const stats = {
    totalAttempts: results.length,
    averageScore: results.reduce((sum, result) => sum + result.score, 0) / results.length,
    passRate: (results.filter(result => result.passed).length / results.length) * 100,
    topScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0
  };

  res.json({
    success: true,
    stats,
    data: results
  });
});

// @desc    Get single quiz result by ID
// @route   GET /api/quiz-results/:resultId
// @access  Private/Student, Tutor
exports.getQuizResultById = asyncHandler(async (req, res) => {
  const { resultId } = req.params;

  const result = await QuizResult.findById(resultId)
    .populate('quizId', 'title passingScore')
    .populate('studentId', 'name email');

  if (!result) {
    res.status(404);
    throw new Error('Quiz result not found');
  }

  // Authorization check
  if (req.user.role === 'student' && result.studentId._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (req.user.role === 'tutor') {
    const quiz = await Quiz.findById(result.quizId);
    if (quiz.createdBy.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }
  }

  res.json({
    success: true,
    data: result
  });
});