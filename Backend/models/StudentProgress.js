const mongoose = require('mongoose');

/**
 * UNIFIED StudentProgress Model
 * Single source of truth for all student progress.
 * Replaces: UserProgress, LessonProgress, and completedLessons on Enrollment.
 */
const studentProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },

  // ── Lesson Tracking ──────────────────────────────────────────────────────
  completedLessons: [{
    lessonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedAt: { type: Date, default: Date.now }
  }],

  // ── Quiz Tracking ────────────────────────────────────────────────────────
  completedQuizzes: [{
    quizId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    completedAt: { type: Date, default: Date.now },
    bestScore:   { type: Number, default: 0 },   // percentage 0-100
    passed:      { type: Boolean, default: false },
    attempts:    { type: Number, default: 0 }
  }],

  // ── Overall Progress ─────────────────────────────────────────────────────
  completionPercentage: { type: Number, default: 0 },  // 0-100
  isCourseCompleted:    { type: Boolean, default: false },
  courseCompletedAt:    { type: Date },

  // ── Gamification ─────────────────────────────────────────────────────────
  totalXP: { type: Number, default: 0 },

  // ── Certificate ──────────────────────────────────────────────────────────
  certificateIssued:   { type: Boolean, default: false },
  certificateIssuedAt: { type: Date },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  lastAccessedAt:   { type: Date, default: Date.now },
  currentLessonId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  currentQuizId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }

}, { timestamps: true });

// Enforce one record per student-course pair
studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// ── Instance Methods ─────────────────────────────────────────────────────────

/** Mark a lesson complete. Idempotent – safe to call multiple times. */
studentProgressSchema.methods.completeLesson = function (lessonId) {
  const id = lessonId.toString();
  const already = this.completedLessons.some(l => l.lessonId.toString() === id);
  if (!already) {
    this.completedLessons.push({ lessonId, completedAt: new Date() });
  }
  this.lastAccessedAt = new Date();
  return this;   // caller must call .recalculate() then .save()
};

/** Update (or insert) a quiz result. Keeps bestScore across attempts. */
studentProgressSchema.methods.updateQuiz = function (quizId, { score, passed, attemptNumber }) {
  const id = quizId.toString();
  const existing = this.completedQuizzes.find(q => q.quizId.toString() === id);

  if (existing) {
    existing.attempts    = attemptNumber;
    existing.bestScore   = Math.max(existing.bestScore, score);
    existing.passed      = existing.passed || passed;   // once passed, stays passed
    existing.completedAt = new Date();
  } else {
    this.completedQuizzes.push({
      quizId,
      completedAt: new Date(),
      bestScore:   score,
      passed,
      attempts:    attemptNumber
    });
  }
  this.lastAccessedAt = new Date();
  return this;
};

/**
 * Recalculate completionPercentage and isCourseCompleted.
 * Pass the full arrays of published lesson IDs and quiz IDs for the course.
 */
studentProgressSchema.methods.recalculate = function (totalLessonIds, totalQuizIds) {
  const totalItems      = totalLessonIds.length + totalQuizIds.length;
  if (totalItems === 0) {
    this.completionPercentage = 0;
    return this;
  }

  const completedLessonCount = this.completedLessons.filter(cl =>
    totalLessonIds.some(id => id.toString() === cl.lessonId.toString())
  ).length;

  const completedQuizCount = this.completedQuizzes.filter(cq =>
    cq.passed && totalQuizIds.some(id => id.toString() === cq.quizId.toString())
  ).length;

  const completedCount      = completedLessonCount + completedQuizCount;
  this.completionPercentage = Math.round((completedCount / totalItems) * 100);

  if (completedCount >= totalItems && !this.isCourseCompleted) {
    this.isCourseCompleted  = true;
    this.courseCompletedAt  = new Date();
  }

  return this;
};

/** Add XP points. */
studentProgressSchema.methods.addXP = function (amount) {
  this.totalXP = (this.totalXP || 0) + amount;
  return this;
};

/** Issue a certificate reference. */
studentProgressSchema.methods.issueCertificate = function (certificateId) {
  if (!this.certificateIssued) {
    this.certificateIssued   = true;
    this.certificateIssuedAt = new Date();
    this.certificateId       = certificateId;
  }
  return this;
};

module.exports = mongoose.model('StudentProgress', studentProgressSchema);