const mongoose = require('mongoose');

// const courseSchema = new mongoose.Schema({
//   title: { type: String, required: true, maxlength: 100 },
//   description: { type: String, required: true, maxlength: 1000 },
//   category: { type: String  },  // optional, for filtering
//   price: { type: Number, default: 0 },  // if you do paid courses
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // reference to the user who created the course
//   status: { type: String, enum: ['draft', 'published'], default: 'draft' },
//   thumbnail: { type: String },  // URL to image
// }, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { type: String },
  price: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  thumbnail: { type: String },
  
  // New fields for better organization
  objectives: [String],
  requirements: [String],
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedDuration: Number, // in hours
  hasCertificate: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
