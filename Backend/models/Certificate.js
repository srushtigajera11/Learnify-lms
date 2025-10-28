const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Certificate identification
  certificateId: { type: String, unique: true, required: true }, // Format: CERT-XXXX-XXXX
  
  // Certificate details
  title: { type: String, default: 'Certificate of Completion' },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: Date, // Optional - if certificates expire
  
  // Storage & Access
  downloadUrl: String,
  verificationUrl: String, // Unique URL for certificate verification
  
  // Performance data
  finalScore: Number,
  completionDate: Date,
  totalHours: Number, // Total learning hours
  grade: String, // A, B, C, etc.
  
  // ADD THESE FOR BETTER TRACKING
  quizResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' }, // Reference to the qualifying quiz attempt
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tutor/admin who issued the certificate
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' }, // Certificate design template
  
  status: { 
    type: String, 
    enum: ['active', 'revoked', 'expired'], 
    default: 'active' 
  },
  
  // Additional metadata
  metadata: {
    issueReason: String,
    comments: String,
    revocationReason: String
  }

}, { timestamps: true });

certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ studentId: 1, courseId: 1 }); // For quick student-course certificate lookup

// Pre-save hook to generate certificate ID
certificateSchema.pre('save', async function(next) {
  if (!this.certificateId) {
    const count = await mongoose.model('Certificate').countDocuments();
    this.certificateId = `CERT-${String(count + 1).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
    this.verificationUrl = `/verify-certificate/${this.certificateId}`;
  }
  next();
});

// Method to check if certificate is valid
certificateSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

module.exports = mongoose.model('Certificate', certificateSchema);