const mongoose = require('mongoose');

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
  
  // Completed items
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  
  completedQuizzes: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    completedAt: Date,
    bestScore: Number,
    attempts: Number
  }],
  
  // Gamification
  totalXP: {
    type: Number,
    default: 0
  },
  
  // Certificate
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  
  // Progress tracking
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  
  currentLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  
  currentQuizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }
  
}, { timestamps: true });

// Compound unique index
studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Method to add XP
studentProgressSchema.methods.addXP = function(amount) {
  this.totalXP += amount;
  return this.save();
};

// Method to mark lesson complete
studentProgressSchema.methods.completeLesson = function(lessonId) {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId);
  }
  return this.save();
};

// Method to mark quiz complete
studentProgressSchema.methods.completeQuiz = function(quizId, score, attempt) {
  const existing = this.completedQuizzes.find(
    q => q.quizId.toString() === quizId.toString()
  );
  
  if (existing) {
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.attempts = attempt;
    existing.completedAt = new Date();
  } else {
    this.completedQuizzes.push({
      quizId,
      completedAt: new Date(),
      bestScore: score,
      attempts: attempt
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('StudentProgress', studentProgressSchema);