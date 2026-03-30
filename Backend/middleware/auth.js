const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// RBAC Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase(); // 👈 normalize
    const allowedRoles = roles.map(role => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: Insufficient role" });
    }
    next();
  };
};

const isBlocked = async (req, res, next) => {
  try {

    // req.user comes from JWT middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin"
      });
    }

    next();

  } catch (error) {

    console.error("Block check error:", error);

    return res.status(500).json({
      message: "Server error"
    });

  }
};
module.exports = {isAuthenticated , authorizeRoles, isBlocked };
