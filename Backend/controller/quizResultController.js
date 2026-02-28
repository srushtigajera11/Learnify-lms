const mongoose      = require('mongoose');
const asyncHandler  = require('express-async-handler');
const QuizResult    = require('../models/QuizResult');
const Quiz          = require('../models/Quiz');
const Lesson        = require('../models/Lesson');
const Enrollment    = require('../models/Enrollment');
const Certificate   = require('../models/Certificate');
const Course        = require('../models/courseModel');
const Gamification  = require('../models/Gamification');
const StudentProgress = require('../models/StudentProgress');

// ─── helper: sync a quiz result into StudentProgress ─────────────────────────

async function syncToStudentProgress(studentId, courseId, quizId, { score, passed, attemptNumber, xpEarned, quiz }) {
  // Get or create the progress doc
  let sp = await StudentProgress.findOne({ studentId, courseId });
  if (!sp) sp = await StudentProgress.create({ studentId, courseId });

  // Update quiz entry (keeps bestScore, tracks passed flag)
  sp.updateQuiz(quizId, { score, passed, attemptNumber });

  // XP: only on first pass
  if (passed && attemptNumber === 1 && xpEarned > 0) {
    sp.addXP(xpEarned);
  }

  // Recalculate overall completion
  const [lessonDocs, quizDocs] = await Promise.all([
    Lesson.find({ courseId, status: 'published' }).select('_id').lean(),
    Quiz.find({ courseId, isPublished: true }).select('_id').lean()
  ]);
  sp.recalculate(
    lessonDocs.map(l => l._id),
    quizDocs.map(q => q._id)
  );

  // ── Certificate check ──────────────────────────────────────────────────
  let certificateGenerated = false;
  let certificate          = null;

  if (quiz.generatesCertificate && passed) {
    const allLessonsDone = lessonDocs.every(l =>
      sp.completedLessons.some(cl => cl.lessonId.toString() === l._id.toString())
    );
    const allQuizzesDone = quizDocs.every(q =>
      sp.completedQuizzes.some(cq => cq.quizId.toString() === q._id.toString() && cq.passed)
    );

    const existingCert = await Certificate.findOne({ studentId, courseId });

    if (allLessonsDone && allQuizzesDone && !existingCert) {
      const course = await Course.findById(courseId);
      certificate = await Certificate.create({
        studentId,
        courseId,
        title:          `Certificate of Completion - ${course.title}`,
        finalScore:     score,
        completionDate: new Date(),
        issuedBy:       course.createdBy,
        status:         'active'
      });

      sp.issueCertificate(certificate._id);
      certificateGenerated = true;

      // Award completion badge
      let gam = await Gamification.findOne({ studentId, courseId });
      if (!gam) gam = await Gamification.create({ studentId, courseId });
      await gam.addBadge({
        badgeName:   'Course Completed',
        badgeType:   'completion',
        badgeIcon:   '🏆',
        description: `Completed ${course.title}`,
        xpReward:    50
      });
      sp.addXP(50);
    }
  }

  await sp.save();
  return { sp, certificateGenerated, certificate };
}

// ─── POST /api/quiz-results/quiz/:quizId/attempt ──────────────────────────────

exports.submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId }            = req.params;
  let   { answers, timeSpent } = req.body;
  const studentId             = req.user.id;

  // ── Validate ─────────────────────────────────────────────────────────────
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    res.status(400);
    throw new Error('Answers are required');
  }
  if (!timeSpent || timeSpent < 0) timeSpent = 0;

  // ── Load quiz ─────────────────────────────────────────────────────────────
  const quiz = await Quiz.findById(quizId);
  if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
  if (!quiz.isPublished) { res.status(403); throw new Error('Quiz is not available'); }

  // ── Enrollment check ──────────────────────────────────────────────────────
  const enrollment = await Enrollment.findOne({ studentId, courseId: quiz.courseId });
  if (!enrollment) { res.status(403); throw new Error('You must be enrolled to attempt this quiz'); }

  // ── Attempt count ─────────────────────────────────────────────────────────
  const previousAttempts = await QuizResult.countDocuments({ studentId, quizId });
  if (previousAttempts >= quiz.maxAttempts) {
    res.status(400);
    throw new Error('Maximum attempts reached for this quiz');
  }
  const attemptNumber = previousAttempts + 1;

  // ── Grade answers ─────────────────────────────────────────────────────────
  let correctAnswers = 0;
  let totalPoints    = 0;
  let earnedPoints   = 0;

  const evaluatedAnswers = answers.map(answer => {
    const question = quiz.questions.id(answer.questionId);
    if (!question) return null;

    const selectedOption = question.options.find(
      opt => opt._id.toString() === answer.selectedOption
    );
    const isCorrect    = selectedOption?.isCorrect ?? false;
    const pointsEarned = isCorrect ? question.points : 0;

    correctAnswers += isCorrect ? 1 : 0;
    earnedPoints   += pointsEarned;
    totalPoints    += question.points;

    return {
      questionId:     answer.questionId,
      selectedOption: answer.selectedOption,
      textAnswer:     answer.textAnswer,
      isCorrect,
      pointsEarned
    };
  }).filter(Boolean);

  if (evaluatedAnswers.length === 0) {
    res.status(400);
    throw new Error('Invalid quiz submission');
  }

  const score  = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= quiz.passingScore;

  // ── XP calculation ────────────────────────────────────────────────────────
  const xpEarned = (passed && attemptNumber === 1 && quiz.xpReward > 0) ? quiz.xpReward : 0;

  // ── Save QuizResult ───────────────────────────────────────────────────────
  const quizResult = await QuizResult.create({
    studentId,
    quizId,
    courseId:      quiz.courseId,
    attemptNumber,
    answers:       evaluatedAnswers,
    totalQuestions: evaluatedAnswers.length,
    correctAnswers,
    score,
    passed,
    timeSpent,
    xpEarned,
    startedAt:   new Date(Date.now() - timeSpent * 60000),
    completedAt: new Date()
  });

  // ── Sync to StudentProgress (THE KEY STEP that was missing) ──────────────
  const { sp, certificateGenerated, certificate } = await syncToStudentProgress(
    studentId,
    quiz.courseId,
    quizId,
    { score, passed, attemptNumber, xpEarned, quiz }
  );

  // Update gamification streak
  let gam = await Gamification.findOne({ studentId, courseId: quiz.courseId });
  if (!gam) gam = await Gamification.create({ studentId, courseId: quiz.courseId });
  if (xpEarned > 0) {
    await gam.addXp(xpEarned, 'quiz_completion');
  } else {
    gam.updateStreak();
    await gam.save();
  }

  // Update quizResult with certificate flag if issued
  if (certificateGenerated) {
    quizResult.certificateIssued = true;
    await quizResult.save();
  }

  res.status(201).json({
    success: true,
    message: passed ? 'Quiz submitted successfully. You passed!' : 'Quiz submitted successfully.',
    // Shape that QuizTaker.jsx expects
    result: {
      score,
      passed,
      correctAnswers,
      totalQuestions:  evaluatedAnswers.length,
      earnedPoints,
      totalPoints,
      attemptNumber,
      xpEarned,
      certificateGenerated,
      certificate,
      answers:         evaluatedAnswers
    },
    // Updated progress snapshot for the UI
    progress: {
      completionPercentage: sp.completionPercentage,
      totalXP:              sp.totalXP,
      isCourseCompleted:    sp.isCourseCompleted,
      certificateIssued:    sp.certificateIssued
    },
    // Keep old `data` field so any existing code that reads res.data.data still works
    data: quizResult
  });
});

// ─── GET /api/quiz-results/quiz/:quizId ──────────────────────────────────────

exports.getStudentQuizResults = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const results = await QuizResult.find({
    studentId: req.user.id,
    quizId
  }).sort({ attemptNumber: 1 });

  res.json({ success: true, count: results.length, data: results });
});

// ─── GET /api/quiz-results/quiz/:quizId/tutor ────────────────────────────────

exports.getQuizResultsForTutor = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user.id });
  if (!quiz) { res.status(404); throw new Error('Quiz not found or access denied'); }

  const results = await QuizResult.find({ quizId })
    .populate('studentId', 'name email')
    .sort({ score: -1 });

  const total = results.length;
  const stats = {
    totalAttempts: total,
    averageScore:  total ? results.reduce((s, r) => s + r.score, 0) / total : 0,
    passRate:      total ? (results.filter(r => r.passed).length / total) * 100 : 0,
    topScore:      total ? Math.max(...results.map(r => r.score)) : 0
  };

  res.json({ success: true, stats, data: results });
});

// ─── GET /api/quiz-results/:resultId ─────────────────────────────────────────

exports.getQuizResultById = asyncHandler(async (req, res) => {
  const result = await QuizResult.findById(req.params.resultId)
    .populate('quizId', 'title passingScore')
    .populate('studentId', 'name email');

  if (!result) { res.status(404); throw new Error('Quiz result not found'); }

  if (req.user.role === 'student' && result.studentId._id.toString() !== req.user.id) {
    res.status(403); throw new Error('Access denied');
  }
  if (req.user.role === 'tutor') {
    const quiz = await Quiz.findById(result.quizId);
    if (quiz.createdBy.toString() !== req.user.id) {
      res.status(403); throw new Error('Access denied');
    }
  }

  res.json({ success: true, data: result });
});