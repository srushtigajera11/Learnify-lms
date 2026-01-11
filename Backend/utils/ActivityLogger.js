// backend/src/utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (admin, action, target = null, details = {}, req = null) => {
  try {
    const logEntry = {
      adminId: admin._id,
      adminEmail: admin.email,
      action,
      ipAddress: req?.ip || 'unknown',
      timestamp: new Date()
    };

    if (target) {
      logEntry.targetType = target.type;
      logEntry.targetId = target.id;
      logEntry.targetName = target.name;
    }

    if (Object.keys(details).length > 0) {
      logEntry.details = details;
    }

    await ActivityLog.create(logEntry);
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

module.exports = { logActivity };