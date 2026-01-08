const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },

    category: { type: String },
    price: { type: Number, default: 0 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },

    adminFeedback: {
      type: String,
      default: '',
    },
   
    submittedAt: {
      type: Date,
    },

    approvedAt: {
      type: Date,
    },

    thumbnail: { type: String },

    objectives: [String],
    requirements: [String],

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    estimatedDuration: Number, // in hours
    hasCertificate: { type: Boolean, default: false },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Performance optimization for admin dashboards
courseSchema.index({ status: 1 });
courseSchema.index({ createdBy: 1, status: 1 });
courseSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
