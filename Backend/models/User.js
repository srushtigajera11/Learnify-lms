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
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },

  avatar: String,

  isBlocked: {
    type: Boolean,
    default: false
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },

  lastLogin: Date,

  verificationToken: String,
  verificationTokenExpiry: Date,

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  /* ---------------- STUDENT PROFILE ---------------- */

  studentProfile: {

    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],

    completedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],

    interests: [String],

    educationLevel: String,

    learningGoals: String

  },

  /* ---------------- TUTOR PROFILE ---------------- */

  tutorProfile: {

    headline: String,

    bio: String,

    location: String,

    expertise: [String],   // ["React", "Node", "AWS"]

    experience: Number,    // years

    qualification: String,

    totalCourses: {
      type: Number,
      default: 0
    },

    socialLinks: {

      youtube: String,

      linkedin: String,

      twitter: String,

      website: String

    }

  }

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);