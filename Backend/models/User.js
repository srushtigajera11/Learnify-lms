const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: true,
    default: 'student'
  },
  isAdmin: { type: Boolean, default: false },
  
  // Essential for all users
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
  
  // Tutor-specific fields (only relevant when role='tutor')
  tutorProfile: {
    headline: String,
    bio: String,
    expertise: [String], // ["Web Development", "JavaScript", "React"]
    experience: Number, // in years
    socialLinks: {
      youtube: String,
      linkedin: String, 
      twitter: String,
      website: String
    }
  }
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);