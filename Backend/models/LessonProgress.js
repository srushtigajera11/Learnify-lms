const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    lastWatchedTime: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", lessonProgressSchema);
