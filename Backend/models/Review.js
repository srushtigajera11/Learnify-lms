const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Just the basics
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { type: String, maxlength: 500 },
  
}, { 
  timestamps: true 
});

// One review per user per course
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
