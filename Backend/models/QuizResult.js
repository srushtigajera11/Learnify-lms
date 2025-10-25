const mongoose = require('mongoose');
const quizResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Attempt details
  attemptNumber: { type: Number, required: true },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: mongoose.Schema.Types.ObjectId, // For multiple choice
    textAnswer: String, // For short answers
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  
  // Results
  totalQuestions: Number,
  correctAnswers: Number,
  score: Number, // Percentage
  passed: Boolean,
  timeSpent: Number, // in minutes
  
  // Timestamps
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

quizResultSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });
module.exports = mongoose.model('QuizResult', quizResultSchema);