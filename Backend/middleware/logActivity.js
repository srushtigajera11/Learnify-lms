// middleware/logActivity.js
const { logActivity } = require('../utils/ActivityLogger');

const withActivityLogging = (action, getTargetData = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log after response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let target = null;
        
        if (getTargetData) {
          target = getTargetData(req, JSON.parse(data));
        }
        
        logActivity(
          req.user, // Assuming user is attached to request
          action,
          target,
          {
            method: req.method,
            endpoint: req.originalUrl,
            statusCode: res.statusCode
          }
        );
      }
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Example usage in routes
router.post('/users/:id/block', 
  authMiddleware, 
  withActivityLogging('USER_BLOCKED', (req) => ({
    type: 'user',
    id: req.params.id,
    name: req.body.email || 'User'
  })),
  userController.blockUser
);