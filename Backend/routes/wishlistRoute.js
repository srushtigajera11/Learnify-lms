const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishlistController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// Add to wishlist
router.post('/add/:courseId', isAuthenticated, authorizeRoles('student'), wishlistController.addToWishlist);

// Get wishlist
router.get('/', isAuthenticated, authorizeRoles('student'), wishlistController.getWishlist);

// Remove from wishlist
router.delete('/remove/:courseId', isAuthenticated, authorizeRoles('student'), wishlistController.removeFromWishlist);

module.exports = router;
