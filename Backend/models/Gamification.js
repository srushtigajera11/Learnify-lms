const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  // ===== CORE IDENTIFICATION =====
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Links to the student user
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  }, // Links to the specific course

  // ===== XP (EXPERIENCE POINTS) SYSTEM =====
  totalXp: { type: Number, default: 0 }, 
  // **Usage**: Total accumulated experience points from all activities
  // **Sources**: Lessons, quizzes, badges, streaks
  // **Example**: 1500 XP

  level: { type: Number, default: 1 },
  // **Usage**: Current student level based on total XP
  // **Calculation**: Level increases as XP grows
  // **Example**: Level 3

  progressToNextLevel: { type: Number, default: 0 },
  // **Usage**: Percentage progress toward next level (0-100)
  // **Purpose**: Visual progress indicator for students

  nextLevelXp: { type: Number, default: 100 },
  // **Usage**: XP required to reach the next level
  // **Purpose**: Clear goal setting

  // ===== BADGE SYSTEM =====
  badges: [{
    badgeId: mongoose.Schema.Types.ObjectId,
    badgeName: String, // "Perfect Score", "Week Warrior", "Quick Learner"
    badgeType: { 
      type: String, 
      enum: ['completion', 'performance', 'streak', 'special'],
      default: 'completion'
    },
    badgeIcon: String,
    description: String,
    earnedDate: { type: Date, default: Date.now },
    xpReward: Number // Bonus XP awarded with this badge
  }],
  // **Usage**: Tracks all earned badges with metadata

  // ===== STREAK SYSTEM =====
  currentStreak: { type: Number, default: 0 },
  // **Usage**: Consecutive days with learning activity
  // **Reset**: Breaks if student misses a day

  longestStreak: { type: Number, default: 0 },
  // **Usage**: Highest streak achieved (personal best)

  lastActivityDate: Date,
  // **Usage**: Tracks last learning activity for streak calculation

}, { timestamps: true });

// Compound index for student-course combination
gamificationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// ===== CORE METHODS =====

// 1. LEVEL CALCULATION METHOD
gamificationSchema.methods.calculateLevel = function() {
  const baseXP = 100;
  const level = Math.floor(Math.sqrt(this.totalXp / baseXP)) + 1;
  const nextLevelXP = Math.pow(level, 2) * baseXP;
  const currentLevelXP = Math.pow(level - 1, 2) * baseXP;
  
  this.level = level;
  this.progressToNextLevel = ((this.totalXp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  this.nextLevelXp = nextLevelXP;
};

// 2. STREAK UPDATE METHOD
gamificationSchema.methods.updateStreak = function() {
  const today = new Date().toDateString();
  const lastActivity = this.lastActivityDate ? new Date(this.lastActivityDate).toDateString() : null;
  
  if (lastActivity === today) return; // Already updated today
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastActivity === yesterdayStr) {
    this.currentStreak += 1; // Continue streak
  } else if (lastActivity !== today) {
    this.currentStreak = 1; // Start new streak
  }
  
  // Update longest streak if current is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastActivityDate = new Date();
};

// 3. ADD XP METHOD
gamificationSchema.methods.addXp = function(points, activityType) {
  this.totalXp += points;
  this.calculateLevel(); // Recalculate level after XP change
  this.updateStreak();   // Update streak since this is a learning activity
  return this.save();
};

// 4. ADD BADGE METHOD
gamificationSchema.methods.addBadge = function(badgeData) {
  this.badges.push(badgeData);
  if (badgeData.xpReward) {
    this.addXp(badgeData.xpReward, 'badge_reward');
  }
  return this.save();
};

module.exports = mongoose.model('Gamification', gamificationSchema);