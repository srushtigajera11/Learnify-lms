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
    required: [true, 'Course ID is required'],
    index: true
  },
  
  // Link to lesson (for practice quizzes)
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson'
  },
  
  // Quiz type determines its purpose
  quizType: {
    type: String,
    enum: ['practice', 'final'],
    default: 'practice'
  },
  
  // Order in course content (for sidebar display)
  order: {
    type: Number
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
    explanation: String
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
    min: [0, 'Time limit cannot be negative']
  },
  maxAttempts: { 
    type: Number, 
    default: 3, // More attempts for practice quizzes
    min: [1, 'Max attempts must be at least 1']
  },
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  shuffleQuestions: { 
    type: Boolean, 
    default: false 
  },
  
  // Gamification
  xpReward: { 
    type: Number, 
    default: function() {
      // Practice quizzes give XP, final quizzes don't (they give certificate)
      return this.quizType === 'practice' ? 10 : 0;
    }
  },
  
  // Certificate settings (only for final quizzes)
  generatesCertificate: {
    type: Boolean,
    default: function() {
      return this.quizType === 'final';
    }
  },
  isFinal :{
    type : Boolean,
    default: false
  },
  // Tutor who created
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Compound index for course content ordering
quizSchema.index({ courseId: 1, order: 1 });
quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ createdBy: 1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Method to check if student can attempt
quizSchema.methods.canAttempt = function(currentAttempts) {
  if (!this.isPublished) {
    return { canAttempt: false, reason: 'Quiz is not published' };
  }
  if (currentAttempts >= this.maxAttempts) {
    return { canAttempt: false, reason: 'Maximum attempts reached' };
  }
  return { canAttempt: true, reason: '' };
};

// Auto-set defaults based on quiz type
quizSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('quizType')) {
    if (this.quizType === 'final') {
      this.maxAttempts = this.maxAttempts || 1;
      this.xpReward = 0;
      this.generatesCertificate = true;
    } else {
      this.maxAttempts = this.maxAttempts || 3;
      this.xpReward = this.xpReward || 10;
      this.generatesCertificate = false;
    }
  }
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);