const asyncHandler    = require('express-async-handler');
const Certificate     = require('../models/Certificate');
const Quiz            = require('../models/Quiz');
const QuizResult      = require('../models/QuizResult');
const Enrollment      = require('../models/Enrollment');
const Lesson          = require('../models/Lesson');
const Course          = require('../models/courseModel');
const User            = require('../models/User');
const StudentProgress = require('../models/StudentProgress');
const PDFDocument     = require('pdfkit');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Check all requirements and return { ok, reason } */
async function checkCertificateEligibility(studentId, courseId) {
  // 1. Must be enrolled
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) return { ok: false, reason: 'Not enrolled in this course' };

  // 2. Load StudentProgress
  const sp = await StudentProgress.findOne({ studentId, courseId });

  // 3. All published lessons must be completed
  const lessons = await Lesson.find({ courseId, status: 'published' }).select('_id').lean();
  if (lessons.length > 0) {
    const completedLessonIds = new Set(
      (sp?.completedLessons || []).map(l => l.lessonId.toString())
    );
    const allLessonsDone = lessons.every(l => completedLessonIds.has(l._id.toString()));
    if (!allLessonsDone) return { ok: false, reason: 'Not all lessons are completed' };
  }

  // 4. Final quiz (generatesCertificate: true) must be passed
  const finalQuiz = await Quiz.findOne({
    courseId,
    generatesCertificate: true,
    isPublished: true
  });
  if (!finalQuiz) return { ok: false, reason: 'No final quiz configured for this course' };

  // Check via StudentProgress first, then QuizResult fallback
  const spQuizEntry = sp?.completedQuizzes?.find(
    q => q.quizId.toString() === finalQuiz._id.toString()
  );
  const finalQuizPassed = spQuizEntry?.passed ||
    await QuizResult.exists({ studentId, quizId: finalQuiz._id, passed: true });

  if (!finalQuizPassed) return { ok: false, reason: 'You must pass the final quiz to claim your certificate' };

  // 5. All quizzes must be passed
  const allQuizzes = await Quiz.find({ courseId, isPublished: true }).select('_id').lean();
  for (const quiz of allQuizzes) {
    const qid = quiz._id.toString();
    const spEntry = sp?.completedQuizzes?.find(q => q.quizId.toString() === qid);
    const passed  = spEntry?.passed ||
      await QuizResult.exists({ studentId, quizId: quiz._id, passed: true });
    if (!passed) return { ok: false, reason: 'Not all quizzes have been passed' };
  }

  // Get best score from final quiz for the certificate
  const bestResult = await QuizResult.findOne({
    studentId,
    quizId: finalQuiz._id,
    passed: true
  }).sort({ score: -1 });

  return { ok: true, finalScore: bestResult?.score || spQuizEntry?.bestScore || 0 };
}

// ─── POST /api/certificates/claim/:courseId ───────────────────────────────────

exports.claimCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId    = req.user.id;

  // Return existing certificate if already claimed
  const existing = await Certificate.findOne({ studentId, courseId });
  if (existing) {
    return res.json({ success: true, message: 'Certificate already issued', data: existing });
  }

  // Check all eligibility requirements
  const eligibility = await checkCertificateEligibility(studentId, courseId);
  if (!eligibility.ok) {
    res.status(400);
    throw new Error(eligibility.reason);
  }

  const course = await Course.findById(courseId);

  // Create certificate — pre('save') hook generates certificateId automatically
  const certificate = new Certificate({
    studentId,
    courseId,
    title:          `Certificate of Completion - ${course.title}`,
    finalScore:     eligibility.finalScore,
    completionDate: new Date(),
    issuedBy:       course.createdBy,
    status:         'active'
  });
  await certificate.save();  // triggers pre('save') to set certificateId + verificationUrl

  // Sync to StudentProgress
  let sp = await StudentProgress.findOne({ studentId, courseId });
  if (!sp) sp = await StudentProgress.create({ studentId, courseId });
  sp.issueCertificate(certificate._id);
  await sp.save();

  res.status(201).json({
    success: true,
    message: 'Certificate issued successfully',
    data:    certificate
  });
});

// ─── GET /api/certificates/my-certificates ────────────────────────────────────

exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ studentId: req.user.id })
    .populate('courseId', 'title thumbnail')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: certificates.length, data: certificates });
});

// ─── GET /api/certificates/:certificateId ────────────────────────────────────

exports.getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('studentId', 'name email')
    .populate('courseId',  'title');

  if (!certificate) { res.status(404); throw new Error('Certificate not found'); }

  if (req.user.role === 'student' && certificate.studentId._id.toString() !== req.user.id) {
    res.status(403); throw new Error('Access denied');
  }

  res.json({ success: true, data: certificate });
});

// ─── GET /api/certificates/verify/:certificateId (public) ────────────────────

exports.verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('studentId', 'name')
    .populate('courseId',  'title');

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }

  res.json({
    success: true,
    data: {
      certificateId: certificate.certificateId,
      studentName:   certificate.studentId.name,
      courseTitle:   certificate.courseId.title,
      issuedAt:      certificate.issuedAt,
      finalScore:    certificate.finalScore,
      status:        certificate.status,
      isValid:       certificate.isValid()
    }
  });
});

// ─── GET /api/certificates/download/:certificateId ───────────────────────────

exports.downloadCertificatePDF = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('studentId', 'name')
    .populate('courseId',  'title');

  if (!certificate) { res.status(404); throw new Error('Certificate not found'); }

  if (req.user.role === 'student' && certificate.studentId._id.toString() !== req.user.id) {
    res.status(403); throw new Error('Access denied');
  }

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });

  res.setHeader('Content-Disposition', `attachment; filename=${certificate.certificateId}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
  doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56).stroke();

  // Header
  doc.fontSize(36).font('Helvetica-Bold')
    .fillColor('#4f46e5')
    .text('Learnify', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(22).font('Helvetica')
    .fillColor('#374151')
    .text('Certificate of Completion', { align: 'center' });

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor('#6b7280')
    .text('This is to certify that', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(30).font('Helvetica-Bold').fillColor('#111827')
    .text(certificate.studentId.name.toUpperCase(), { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica').fillColor('#6b7280')
    .text('has successfully completed the course', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#4f46e5')
    .text(`"${certificate.courseId.title}"`, { align: 'center' });

  doc.moveDown(1.5);
  doc.fontSize(14).font('Helvetica').fillColor('#374151')
    .text(`Final Score: ${certificate.finalScore?.toFixed(1)}%`, { align: 'center' });

  doc.moveDown(0.5);
  doc.text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#9ca3af')
    .text(`Certificate ID: ${certificate.certificateId}`, { align: 'center' });

  doc.end();
});