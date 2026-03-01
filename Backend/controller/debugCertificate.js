/**
 * DEBUG ROUTE — add temporarily to certificateRoutes.js
 * GET /api/certificates/debug/:courseId
 * 
 * Returns a full breakdown of why certificate is locked/unlocked.
 * REMOVE THIS BEFORE PRODUCTION.
 */
const debugCertificate = async (req, res) => {
  const mongoose        = require('mongoose');
  const { courseId }    = req.params;
  const studentId       = req.user.id;

  const Lesson          = require('../models/Lesson');
  const Quiz            = require('../models/Quiz');
  const QuizResult      = require('../models/QuizResult');
  const Enrollment      = require('../models/Enrollment');
  const Certificate     = require('../models/Certificate');
  const StudentProgress = require('../models/StudentProgress');

  const report = { studentId, courseId, checks: {} };

  // 1. Enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  report.checks.enrolled = !!enrollment;

  // 2. StudentProgress
  const sp = await StudentProgress.findOne({ studentId, courseId }).lean();
  report.studentProgress = sp
    ? {
        completionPercentage: sp.completionPercentage,
        isCourseCompleted:    sp.isCourseCompleted,
        totalXP:              sp.totalXP,
        certificateIssued:    sp.certificateIssued,
        completedLessons:     sp.completedLessons?.map(l => l.lessonId?.toString()),
        completedQuizzes:     sp.completedQuizzes?.map(q => ({
          quizId:    q.quizId?.toString(),
          passed:    q.passed,
          bestScore: q.bestScore,
          attempts:  q.attempts
        }))
      }
    : null;

  // 3. Lessons
  const lessons = await Lesson.find({ courseId, status: 'published' }).select('_id title').lean();
  report.checks.lessons = lessons.map(l => ({
    id:        l._id.toString(),
    title:     l.title,
    completed: sp?.completedLessons?.some(cl => cl.lessonId?.toString() === l._id.toString()) ?? false
  }));
  report.checks.allLessonsDone = report.checks.lessons.every(l => l.completed);

  // 4. Quizzes
  const quizzes = await Quiz.find({ courseId, isPublished: true }).select('_id title generatesCertificate').lean();
  const quizResults = await QuizResult.find({ studentId, courseId }).lean();

  report.checks.quizzes = await Promise.all(quizzes.map(async q => {
    const qid     = q._id.toString();
    const spEntry = sp?.completedQuizzes?.find(cq => cq.quizId?.toString() === qid);
    const rawResults = quizResults.filter(r => r.quizId.toString() === qid);
    const passedRaw  = rawResults.some(r => r.passed);

    return {
      id:                   qid,
      title:                q.title,
      generatesCertificate: q.generatesCertificate,
      spEntry:              spEntry || null,
      passedViaStudentProgress: spEntry?.passed ?? false,
      passedViaQuizResult:  passedRaw,
      rawAttempts:          rawResults.length,
      finallyPassed:        (spEntry?.passed ?? false) || passedRaw
    };
  }));

  report.checks.allQuizzesDone   = report.checks.quizzes.every(q => q.finallyPassed);
  report.checks.finalQuizPassed  = report.checks.quizzes.some(q => q.generatesCertificate && q.finallyPassed);

  // 5. Existing certificate
  const cert = await Certificate.findOne({ studentId, courseId });
  report.existingCertificate = cert
    ? { id: cert._id, certificateId: cert.certificateId, status: cert.status }
    : null;

  // 6. Final verdict
  report.certificateUnlocked =
    report.checks.enrolled &&
    report.checks.allLessonsDone &&
    report.checks.allQuizzesDone &&
    report.checks.finalQuizPassed;

  report.blockedBecause = [];
  if (!report.checks.enrolled)       report.blockedBecause.push('Not enrolled');
  if (!report.checks.allLessonsDone) report.blockedBecause.push('Some lessons incomplete: ' +
    report.checks.lessons.filter(l => !l.completed).map(l => l.title).join(', '));
  if (!report.checks.allQuizzesDone) report.blockedBecause.push('Some quizzes not passed: ' +
    report.checks.quizzes.filter(q => !q.finallyPassed).map(q => q.title).join(', '));
  if (!report.checks.finalQuizPassed) report.blockedBecause.push('Final quiz not passed');

  return res.json({ success: true, report });
};

module.exports = debugCertificate;