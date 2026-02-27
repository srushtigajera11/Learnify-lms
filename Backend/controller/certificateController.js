const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Enrollment = require('../models/Enrollment');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// ===============================
// 1️⃣ Claim Certificate
// ===============================
exports.claimCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    studentId: req.user.id,
    courseId
  });

  if (existingCertificate) {
    return res.json({
      success: true,
      message: 'Certificate already issued',
      data: existingCertificate
    });
  }

  // Find final quiz
  const finalQuiz = await Quiz.findOne({
    courseId,
    generatesCertificate: true,
    isPublished: true
  });

  if (!finalQuiz) {
    res.status(400);
    throw new Error('Final quiz not configured for this course');
  }

  // Find passed attempt
  const passedAttempt = await QuizResult.findOne({
    studentId: req.user.id,
    quizId: finalQuiz._id,
    passed: true
  }).sort({ score: -1 });

  if (!passedAttempt) {
    res.status(400);
    throw new Error('You must pass the final quiz to claim certificate');
  }

  // Create certificate
  const certificate = await Certificate.create({
    studentId: req.user.id,
    courseId,
    quizResultId: passedAttempt._id,
    finalScore: passedAttempt.score,
    completionDate: new Date()
  });

  // Mark quiz result
  passedAttempt.certificateIssued = true;
  await passedAttempt.save();

  res.status(201).json({
    success: true,
    message: 'Certificate issued successfully',
    data: certificate
  });
});


// ===============================
// 2️⃣ Get My Certificates
// ===============================
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    studentId: req.user.id
  })
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});


// ===============================
// 3️⃣ Get Certificate By ID (Private)
// ===============================
exports.getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.certificateId
  })
    .populate('studentId', 'name email')
    .populate('courseId', 'title');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  // Authorization (only owner can access privately)
  if (
    req.user.role === 'student' &&
    certificate.studentId._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({
    success: true,
    data: certificate
  });
});

// ===============================
// 5️⃣ Download Certificate PDF
// ===============================
exports.downloadCertificatePDF = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({
    certificateId
  })
    .populate('studentId', 'name')
    .populate('courseId', 'title')
    .populate('quizResultId', 'score');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  // Only owner can download
  if (
    req.user.role === 'student' &&
    certificate.studentId._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50
  });

  // Set headers
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${certificate.certificateId}.pdf`
  );
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);

  // ===== Certificate Design =====

  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .stroke();

  doc.fontSize(30)
    .text('Learnify', { align: 'center' });

  doc.moveDown();

  doc.fontSize(24)
    .text('Certificate of Completion', { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(18)
    .text('This is to certify that', { align: 'center' });

  doc.moveDown();

  doc.fontSize(28)
    .text(certificate.studentId.name.toUpperCase(), {
      align: 'center'
    });

  doc.moveDown();

  doc.fontSize(18)
    .text('has successfully completed the course', {
      align: 'center'
    });

  doc.moveDown();

  doc.fontSize(24)
    .text(`"${certificate.courseId.title}"`, {
      align: 'center'
    });

  doc.moveDown(2);

  doc.fontSize(16)
    .text(`Final Score: ${certificate.finalScore.toFixed(2)}%`, {
      align: 'center'
    });

  doc.moveDown();

  doc.text(`Issued on: ${certificate.issuedAt.toDateString()}`, {
    align: 'center'
  });

  doc.moveDown();

  doc.text(`Certificate ID: ${certificate.certificateId}`, {
    align: 'center'
  });

  doc.moveDown();

  doc.text(`Verify at: /api/certificates/verify/${certificate.certificateId}`, {
    align: 'center'
  });

  doc.end();
});
// ===============================
// 4️⃣ Public Verification
// ===============================
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.certificateId
  })
    .populate('studentId', 'name')
    .populate('courseId', 'title');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  res.json({
    success: true,
    data: {
      certificateId: certificate.certificateId,
      studentName: certificate.studentId.name,
      courseTitle: certificate.courseId.title,
      issuedAt: certificate.issuedAt,
      status: certificate.status,
      isValid: certificate.isValid()
    }
  });
});