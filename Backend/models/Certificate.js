const mongoose = require('mongoose');
const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userProgressId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProgress', required: true },
  
  // Certificate identification

  certificateId: { type: String, unique: true, required: true }, // Custom format: CERT-XXXX-XXXX
  verificationCode: { type: String, unique: true, required: true },
  
  // Certificate details
  issuedAt: { type: Date, default: Date.now },
  expiresAt: Date, // Optional - if certificates expire
  downloadUrl: String,
  
  // Performance data (if applicable)
  finalScore: Number,
  completionDate: Date,
  
  status: { type: String, enum: ['active', 'revoked'], default: 'active' }
}, { timestamps: true });

certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);