const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledAt: { type: Date, default: Date.now },

    // ✅ Each completed lesson stored as { lessonId, completedAt }
    progress: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Virtual: returns array of lessonId strings (used throughout controllers)
enrollmentSchema.virtual('completedLessons').get(function () {
  return (this.progress || []).map((p) => p.lessonId?.toString()).filter(Boolean);
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);