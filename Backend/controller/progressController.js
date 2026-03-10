/**
 * progressController.js
 */
const mongoose        = require('mongoose');
const Lesson          = require('../models/Lesson');
const Quiz            = require('../models/Quiz');
const Course          = require('../models/courseModel');
const QuizResult      = require('../models/QuizResult');
const Certificate     = require('../models/Certificate');
const Gamification    = require('../models/Gamification');
const StudentProgress = require('../models/StudentProgress');

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getCourseContentIds(courseId) {
  const [lessonDocs, quizDocs] = await Promise.all([
    Lesson.find({ courseId, status: 'published' }).select('_id').lean(),
    Quiz.find({ courseId, isPublished: true }).select('_id').lean(),
  ]);
  return {
    lessonIds: lessonDocs.map((l) => l._id),
    quizIds:   quizDocs.map((q) => q._id),
  };
}

async function getOrCreateProgress(studentId, courseId) {
  let progress = await StudentProgress.findOne({ studentId, courseId });
  if (!progress) progress = await StudentProgress.create({ studentId, courseId });
  return progress;
}

// ─── Mark lesson complete ─────────────────────────────────────────────────────

exports.markLessonComplete = async (req, res) => {
  try {
    const studentId              = req.user.id;
    const { courseId, lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ success: false, message: 'Invalid lesson ID' });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const progress = await getOrCreateProgress(studentId, courseId);

    const wasAlreadyComplete = progress.completedLessons.some(
      (l) => l.lessonId.toString() === lessonId
    );

    let xpEarned = 0;

    if (!wasAlreadyComplete) {
      // ✅ Mark lesson complete
      progress.completeLesson(lessonId);

      // ✅ Award base XP
      const XP_PER_LESSON = 5;
      xpEarned += XP_PER_LESSON;
      progress.addXP(XP_PER_LESSON);

      // ✅ Recalculate BEFORE checking badge thresholds
      const { lessonIds, quizIds } = await getCourseContentIds(courseId);
      progress.recalculate(lessonIds, quizIds);

      // ── Gamification ──────────────────────────────────────────────────────
      let gamification = await Gamification.findOne({ studentId, courseId });
      if (!gamification) {
        gamification = await Gamification.create({ studentId, courseId });
      }
      gamification.updateStreak();

      const totalCompleted = progress.completedLessons.length;

      // Badge: First Step
      if (totalCompleted === 1) {
        const alreadyHas = gamification.badges.some((b) => b.badgeName === 'First Step');
        if (!alreadyHas) {
          gamification.badges.push({
            badgeName:   'First Step',
            badgeType:   'completion',
            badgeIcon:   '👣',
            description: 'Completed your first lesson!',
            xpReward:    10,
          });
          xpEarned += 10;
          progress.addXP(10);
        }
      }

      // Badge: Halfway There
      const halfwayPoint = Math.ceil(lessonIds.length / 2);
      if (lessonIds.length > 0 && totalCompleted === halfwayPoint) {
        const alreadyHas = gamification.badges.some((b) => b.badgeName === 'Halfway There');
        if (!alreadyHas) {
          gamification.badges.push({
            badgeName:   'Halfway There',
            badgeType:   'completion',
            badgeIcon:   '⚡',
            description: 'Completed half the course!',
            xpReward:    20,
          });
          xpEarned += 20;
          progress.addXP(20);
        }
      }

      // ✅ Save BOTH documents
      await Promise.all([
        progress.save(),
        gamification.save(),
      ]);
    }

    return res.status(200).json({
      success:              true,
      message:              wasAlreadyComplete ? 'Already completed' : 'Lesson marked complete',
      xpEarned,
      completionPercentage: progress.completionPercentage,
      totalXP:              progress.totalXP,
      isCourseCompleted:    progress.isCourseCompleted,
    });

  } catch (err) {
    console.error('markLessonComplete error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Submit quiz attempt ──────────────────────────────────────────────────────

exports.submitQuizAttempt = async (req, res) => {
  try {
    const studentId              = req.user.id;
    const { courseId, quizId }   = req.params;
    const { answers }            = req.body;

    const quiz = await Quiz.findOne({ _id: quizId, courseId, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Attempt count check
    const previousAttempts = await QuizResult.find({ studentId, quizId })
      .sort('-attemptNumber')
      .lean();
    const attemptNumber = previousAttempts.length > 0
      ? previousAttempts[0].attemptNumber + 1
      : 1;

    if (attemptNumber > quiz.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }

    // Grade answers
    let correctCount = 0;
    let totalPoints  = 0;
    let earnedPoints = 0;

    const gradedAnswers = quiz.questions.map((question) => {
      totalPoints += question.points;
      const studentAnswer = answers[question._id.toString()];
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect     = studentAnswer === correctOption?._id.toString();

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId:     question._id,
        selectedOption: studentAnswer,
        isCorrect,
        pointsEarned:   isCorrect ? question.points : 0,
      };
    });

    const score  = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Persist QuizResult
    const quizResult = await QuizResult.create({
      studentId,
      quizId,
      courseId,
      attemptNumber,
      answers:        gradedAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      score,
      passed,
      startedAt:      new Date(),
      completedAt:    new Date(),
    });

    // Update StudentProgress
    const progress = await getOrCreateProgress(studentId, courseId);
    progress.updateQuiz(quizId, { score, passed, attemptNumber });

    let xpEarned = 0;
    if (passed && attemptNumber === 1 && quiz.xpReward > 0) {
      xpEarned = quiz.xpReward;
      progress.addXP(xpEarned);
      quizResult.xpEarned = xpEarned;
      await quizResult.save();
    }

    const { lessonIds, quizIds } = await getCourseContentIds(courseId);
    progress.recalculate(lessonIds, quizIds);

    // Gamification
    let gamification = await Gamification.findOne({ studentId, courseId });
    if (!gamification) gamification = await Gamification.create({ studentId, courseId });
    gamification.updateStreak();

    if (passed) {
      // Badge: Quick Learner
      if (attemptNumber === 1) {
        const alreadyHas = gamification.badges.some((b) => b.badgeName === 'Quick Learner');
        if (!alreadyHas) {
          gamification.badges.push({
            badgeName:   'Quick Learner',
            badgeType:   'performance',
            badgeIcon:   '🚀',
            description: 'Passed a quiz on the first attempt!',
            xpReward:    15,
          });
          progress.addXP(15);
          xpEarned += 15;
        }
      }

      // Badge: Perfect Score
      if (score === 100) {
        const alreadyHas = gamification.badges.some((b) => b.badgeName === 'Perfect Score');
        if (!alreadyHas) {
          gamification.badges.push({
            badgeName:   'Perfect Score',
            badgeType:   'performance',
            badgeIcon:   '⭐',
            description: 'Scored 100% on a quiz!',
            xpReward:    25,
          });
          progress.addXP(25);
          xpEarned += 25;
        }
      }
    }

    // Certificate check
    let certificateGenerated = false;
    let certificate          = null;

    if (quiz.generatesCertificate && passed) {
      const allLessonsDone = lessonIds.every((id) =>
        progress.completedLessons.some((l) => l.lessonId.toString() === id.toString())
      );
      const allQuizzesDone = quizIds.every((id) =>
        progress.completedQuizzes.some(
          (q) => q.quizId.toString() === id.toString() && q.passed
        )
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
          quizResultId:   quizResult._id,
          issuedBy:       course.createdBy,
          status:         'active',
        });

        progress.issueCertificate(certificate._id);
        certificateGenerated         = true;
        quizResult.certificateIssued = true;
        await quizResult.save();

        // Badge: Course Completed
        const alreadyHas = gamification.badges.some((b) => b.badgeName === 'Course Completed');
        if (!alreadyHas) {
          gamification.badges.push({
            badgeName:   'Course Completed',
            badgeType:   'completion',
            badgeIcon:   '🏆',
            description: `Completed ${course.title}`,
            xpReward:    50,
          });
          progress.addXP(50);
          xpEarned += 50;
        }
      }
    }

    // ✅ Save BOTH documents
    await Promise.all([
      progress.save(),
      gamification.save(),
    ]);

    return res.status(200).json({
      success: true,
      result: {
        score,
        passed,
        correctAnswers:      correctCount,
        totalQuestions:      quiz.questions.length,
        earnedPoints,
        totalPoints,
        attemptNumber,
        xpEarned,
        certificateGenerated,
        certificate,
        answers:             gradedAnswers,
      },
      progress: {
        completionPercentage: progress.completionPercentage,
        totalXP:              progress.totalXP,
        isCourseCompleted:    progress.isCourseCompleted,
        certificateIssued:    progress.certificateIssued,
      },
    });

  } catch (err) {
    console.error('submitQuizAttempt error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Get course progress ──────────────────────────────────────────────────────

exports.getCourseProgress = async (req, res) => {
  try {
    const studentId        = req.user.id;
    const { courseId }     = req.params;
    const { lessonIds, quizIds } = await getCourseContentIds(courseId);

    let progress = await StudentProgress.findOne({ studentId, courseId })
      .populate('certificateId')
      .lean();

    if (!progress) {
      return res.status(200).json({
        success: true,
        progress: {
          studentId,
          courseId,
          completedLessons:     [],
          completedQuizzes:     [],
          completionPercentage: 0,
          isCourseCompleted:    false,
          totalXP:              0,
          certificateIssued:    false,
          certificateId:        null,
          totalLessons:         lessonIds.length,
          totalQuizzes:         quizIds.length,
          totalItems:           lessonIds.length + quizIds.length,
        },
      });
    }

    return res.status(200).json({
      success:  true,
      progress: {
        ...progress,
        totalLessons: lessonIds.length,
        totalQuizzes: quizIds.length,
        totalItems:   lessonIds.length + quizIds.length,
      },
    });

  } catch (err) {
    console.error('getCourseProgress error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Get all progress ─────────────────────────────────────────────────────────

exports.getAllProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const progresses = await StudentProgress.find({ studentId })
      .populate('courseId', 'title thumbnail description')
      .sort('-updatedAt')
      .lean();

    const stats = {
      totalCourses:      progresses.length,
      completedCourses:  progresses.filter((p) => p.isCourseCompleted).length,
      inProgress:        progresses.filter((p) => !p.isCourseCompleted && p.completionPercentage > 0).length,
      notStarted:        progresses.filter((p) => p.completionPercentage === 0).length,
      totalXP:           progresses.reduce((sum, p) => sum + (p.totalXP || 0), 0),
      averageCompletion: progresses.length
        ? Math.round(progresses.reduce((sum, p) => sum + p.completionPercentage, 0) / progresses.length)
        : 0,
    };

    return res.status(200).json({ success: true, progresses, stats });

  } catch (err) {
    console.error('getAllProgress error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};