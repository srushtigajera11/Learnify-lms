const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['video', 'link', 'document', 'video_lesson'],
    default: 'document'
  },
  description: { type: String }
}, { _id: true });

const lessonSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 200,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  materials: [materialSchema],
  order: { 
    type: Number, 
    required: true,
    min: 1
  },
  
  // Lesson type field
  lessonType: { 
    type: String, 
    enum: ['video', 'text', 'quiz', 'mixed'],
    default: 'text'
  },
  
  duration: { 
    type: Number, 
    min: 0,
    default: 0
  }, // in minutes
  
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz' 
  }, // if lesson contains a quiz
  
  isPreview: { 
    type: Boolean, 
    default: false 
  }, // free preview lesson
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for course lessons ordering
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

// Virtual for formatted duration
lessonSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return '0 min';
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  return `${minutes}m`;
});

// Helper method to check if lesson has video
lessonSchema.methods.hasVideo = function() {
  return this.materials.some(m => 
    m.type === 'video' || 
    m.type === 'video_lesson' ||
    m.url?.match(/\.(mp4|webm|ogg)$/i) ||
    m.url?.includes('youtube') || 
    m.url?.includes('youtu.be') ||
    m.url?.includes('vimeo')
  );
};

module.exports = mongoose.model('Lesson', lessonSchema);