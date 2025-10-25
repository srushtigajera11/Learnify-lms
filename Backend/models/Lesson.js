const mongoose = require('mongoose');
const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ['video', 'link','document'] }
});

const lessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String },
  materials: [materialSchema],
  order: { type: Number, required: true },
  
  // New fields for flexibility
  lessonType: { 
    type: String, 
    enum: ['video', 'text', 'quiz']
  },
  duration: Number, // in minutes
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // if lesson contains a quiz
  isPreview: { type: Boolean, default: false } // free preview lesson
}, { timestamps: true });
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });
module.exports = mongoose.model('Lesson', lessonSchema);