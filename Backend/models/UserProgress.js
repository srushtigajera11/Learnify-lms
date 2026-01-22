// models/UserProgress.js
const mongoose = require('mongoose');
const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ 
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedAt: { type: Date, default: Date.now }
  }],
  
  totalLessons: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  quizResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' }],
  averageScore: { type: Number, default: 0 }
}, { timestamps: true });

userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
