const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // Optional - if attached to specific lesson
  
  // Quiz configuration
  questions: [{
    questionText: { type: String, required: true },
    questionType: { 
      type: String, 
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For short answers
    points: { type: Number, default: 1 },
    explanation: String // For review
  }],
  
  // Quiz settings
  passingScore: { type: Number, default: 70 },
  timeLimit: Number, // in minutes
  maxAttempts: { type: Number, default: 1 },
  isPublished: { type: Boolean, default: false },
  shuffleQuestions: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);