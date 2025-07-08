// controllers/progressController.js
const UserProgress = require('../models/UserProgress');

exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const progress = await UserProgress.findOneAndUpdate(
      { userId, courseId },
      { $addToSet: { completedLessons: lessonId } },
      { new: true, upsert: true }
    );

    res.json({ completedLessons: progress.completedLessons });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress', error });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const progress = await UserProgress.findOne({ userId, courseId });

    res.json({ completedLessons: progress?.completedLessons || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress', error });
  }
};
