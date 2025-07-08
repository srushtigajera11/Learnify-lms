const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { type: String  },  // optional, for filtering
  price: { type: Number, default: 0 },  // if you do paid courses
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // reference to the user who created the course
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  thumbnail: { type: String },  // URL to image
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
