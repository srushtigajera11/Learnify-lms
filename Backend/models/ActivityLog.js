// backend/src/models/ActivityLog.js - Make sure this file exists
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminEmail: String,
  action: String,
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  targetName: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);