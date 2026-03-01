/**
 * StudentContentController.js
 * Uses StudentProgress as the single source of truth.
 */
const Lesson          = require('../models/Lesson');
const Quiz            = require('../models/Quiz');
const Course          = require('../models/courseModel');
const Enrollment      = require('../models/Enrollment');
const Gamification    = require('../models/Gamification');
const Certificate     = require('../models/Certificate');
const QuizResult      = require('../models/QuizResult');
const StudentProgress = require('../models/StudentProgress');

async function getOrCreateProgress(studentId, courseId) {
  let p = await StudentProgress.findOne({ studentId, courseId });
  if (!p) p = await StudentProgress.create({ studentId, courseId });
  return p;
}

exports.getUnifiedCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId    = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(courseId)
      .select('title description thumbnail')
      .populate('createdBy', 'name');

    const [lessons, quizzes] = await Promise.all([
      Lesson.find({ courseId, status: 'published' }).sort('order').lean(),
      Quiz.find({ courseId, isPublished: true }).sort('order').lean()
    ]);

    const progress    = await getOrCreateProgress(studentId, courseId);
    const quizResults = await QuizResult.find({ studentId, courseId }).lean();

    let gamification = await Gamification.findOne({ studentId, courseId });
    if (!gamification) {
      gamification = await Gamification.create({ studentId, courseId, totalXp: 0, level: 1 });
    }

    const certificate = await Certificate.findOne({ studentId, courseId, status: 'active' });

    // Build content list
    const contentItems = [];

    lessons.forEach(lesson => {
      const isCompleted = progress.completedLessons.some(
        l => l.lessonId.toString() === lesson._id.toString()
      );
      contentItems.push({
        _id:         lesson._id,
        type:        'lesson',
        title:       lesson.title,
        description: lesson.description,
        order:       lesson.order,
        duration:    lesson.totalDuration || 0,
        lessonType:  lesson.lessonType,
        isCompleted
      });
    });

    quizzes.forEach(quiz => {
      const attempts = quizResults.filter(r => r.quizId.toString() === quiz._id.toString());
      const best     = attempts.length
        ? attempts.reduce((b, c) => c.score > b.score ? c : b)
        : null;

      const progressEntry = progress.completedQuizzes.find(
        q => q.quizId.toString() === quiz._id.toString()
      );

      contentItems.push({
        _id:                  quiz._id,
        type:                 'quiz',
        title:                quiz.title,
        description:          quiz.description,
        order:                quiz.order,
        duration:             quiz.timeLimit || 0,
        quizType:             quiz.quizType,
        xpReward:             quiz.xpReward,
        generatesCertificate: quiz.generatesCertificate,
        passingScore:         quiz.passingScore,
        maxAttempts:          quiz.maxAttempts,
        attempts:             attempts.length,
        bestScore:            progressEntry?.bestScore ?? best?.score ?? 0,
        isCompleted:          progressEntry?.passed ?? best?.passed ?? false
      });
    });

    contentItems.sort((a, b) => a.order - b.order);

    const lessonIds = lessons.map(l => l._id);
    const quizIds   = quizzes.map(q => q._id);
    progress.recalculate(lessonIds, quizIds);
    await progress.save();

    const totalItems     = contentItems.length;
    const completedItems = contentItems.filter(i => i.isCompleted).length;
    const completionPct  = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // === CERTIFICATE UNLOCK — checked against StudentProgress + QuizResult fallback ===

    // 1. Is the final quiz (generatesCertificate: true) passed?
    const finalQuizPassed = quizzes.some(quiz => {
      if (!quiz.generatesCertificate) return false;
      const qid     = quiz._id.toString();
      const spEntry = progress.completedQuizzes.find(cq => cq.quizId.toString() === qid);
      if (spEntry && spEntry.passed) return true;
      // Fallback for pre-migration quiz results
      return quizResults.some(r => r.quizId.toString() === qid && r.passed);
    });

    // 2. Are all lessons marked complete?
    const allLessonsDone = lessonIds.length === 0 || lessonIds.every(id =>
      progress.completedLessons.some(cl => cl.lessonId.toString() === id.toString())
    );

    // 3. Are all quizzes passed? (no quizzes = automatically satisfied)
    const allQuizzesDone = quizIds.length === 0 || quizIds.every(id => {
      const qid     = id.toString();
      const spEntry = progress.completedQuizzes.find(cq => cq.quizId.toString() === qid);
      if (spEntry && spEntry.passed) return true;
      return quizResults.some(r => r.quizId.toString() === qid && r.passed);
    });

    const certificateUnlocked = finalQuizPassed && allLessonsDone && allQuizzesDone;

    // Add certificate slot
    const maxOrder = contentItems.reduce((max, i) => Math.max(max, i.order || 0), 0);
    contentItems.push({
      _id:           certificate?._id || 'certificate',
      type:          'certificate',
      title:         'Certificate of Completion',
      description:   'Claim your certificate',
      order:         maxOrder + 1,
      duration:      0,
      isCompleted:   !!certificate,
      isLocked:      !certificateUnlocked,
      certificate:   certificate || null,
      certificateId: certificate?.certificateId || null
    });

    return res.status(200).json({
      success: true,
      course,
      content: contentItems,
      progress: {
        completedItems,
        totalItems:           totalItems + 1,
        completionPercentage: completionPct,
        totalXP:              progress.totalXP,
        level:                gamification.level,
        progressToNextLevel:  gamification.progressToNextLevel,
        currentStreak:        gamification.currentStreak,
        certificateIssued:    !!certificate,
        certificate:          certificate || null
      }
    });

  } catch (err) {
    console.error('getUnifiedCourseContent error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId              = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled' });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const progress    = await StudentProgress.findOne({ studentId, courseId });
    const isCompleted = progress?.completedLessons.some(
      l => l.lessonId.toString() === lessonId
    ) ?? false;

    return res.status(200).json({
      success: true,
      lesson:  { ...lesson.toObject(), isCompleted }
    });

  } catch (err) {
    console.error('getLessonContent error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getQuizContent = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const studentId            = req.user.id;

    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled' });
    }

    const quiz = await Quiz.findOne({ _id: quizId, courseId, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const quizResults = await QuizResult.find({ studentId, quizId }).sort('-attemptNumber').lean();
    const attempts    = quizResults.length;
    const best        = attempts > 0
      ? quizResults.reduce((b, c) => c.score > b.score ? c : b)
      : null;

    const sp      = await StudentProgress.findOne({ studentId, courseId });
    const spEntry = sp?.completedQuizzes.find(q => q.quizId.toString() === quizId);

    return res.status(200).json({
      success: true,
      quiz: {
        ...quiz.toObject(),
        attempts,
        bestScore:  spEntry?.bestScore ?? best?.score ?? 0,
        passed:     spEntry?.passed    ?? best?.passed ?? false,
        canAttempt: attempts < quiz.maxAttempts
      }
    });

  } catch (err) {
    console.error('getQuizContent error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NOTE: markLessonComplete and submitQuizAttempt live in progressController.js
// Import them directly from there in your routes file.