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
  
  // ADD THESE FOR GAMIFICATION & CERTIFICATION
  xpEarned: { type: Number, default: 0 }, // XP from this quiz attempt
  badgeEarned: { 
    badgeId: mongoose.Schema.Types.ObjectId,
    badgeName: String
  }, // Badges for exceptional performance
  certificateIssued: { type: Boolean, default: false }, // If certificate was generated
  
  // Timestamps
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

quizResultSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Add a method to calculate score
quizResultSchema.methods.calculateScore = function() {
  this.correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
  this.totalQuestions = this.answers.length;
  this.score = (this.correctAnswers / this.totalQuestions) * 100;
  this.passed = this.score >= (this.quizId.passingScore || 70);
  return this.score;
};

module.exports = mongoose.model('QuizResult', quizResultSchema);