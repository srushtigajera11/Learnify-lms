const Wishlist = require('../models/Wishlist');

// Add course to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if already exists
    const existing = await Wishlist.findOne({ userId: req.user.id, courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      courseId,
    });

    res.status(201).json({ success: true, wishlistItem });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all wishlist courses for logged-in user
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user.id }).populate('courseId');

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove course from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    const removed = await Wishlist.findOneAndDelete({
      userId: req.user.id,
      courseId,
    });

    if (!removed) {
      return res.status(404).json({ success: false, message: 'Course not found in wishlist' });
    }

    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
