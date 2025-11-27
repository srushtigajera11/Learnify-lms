const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Quiz title is required'] 
  },
  description: String,
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: [true, 'Course ID is required'] 
  },

  questions: [{
    questionText: { 
      type: String, 
      required: [true, 'Question text is required'] 
    },
    questionType: { 
      type: String, 
      enum: ['multiple-choice', 'true-false'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    points: { 
      type: Number, 
      default: 1,
      min: [1, 'Points must be at least 1']
    },
    explanation: String // For review
  }],
  
  // Quiz settings
  passingScore: { 
    type: Number, 
    default: 70,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  timeLimit: { 
    type: Number, 
    min: [1, 'Time limit must be at least 1 minute'] 
  }, // in minutes
  maxAttempts: { 
    type: Number, 
    default: 1,
    min: [1, 'Max attempts must be at least 1']
  },
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  shuffleQuestions: { 
    type: Boolean, 
    default: false 
  },lessonId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Lesson' 
},
  
  // Gamification & Certification
  isFinalQuiz: { 
    type: Boolean, 
    default: false 
  }, // Marks if this is the certificate-qualifying quiz
  xpReward: { 
    type: Number, 
    default: 0 
  }, // XP awarded for completing (not necessarily passing)
  
  // Tutor who created this quiz
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Index for better query performance
quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ createdBy: 1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Method to check if student can attempt quiz
quizSchema.methods.canAttempt = function(studentId, currentAttempts) {
  if (!this.isPublished) return { canAttempt: false, reason: 'Quiz is not published' };
  if (currentAttempts >= this.maxAttempts) return { canAttempt: false, reason: 'Maximum attempts reached' };
  return { canAttempt: true, reason: '' };
};

module.exports = mongoose.model('Quiz', quizSchema);