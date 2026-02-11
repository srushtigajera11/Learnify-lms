const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["video", "document", "link"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
    },

    public_id: {
      type: String, // for cloudinary delete / signed URLs
    },

    duration: {
      type: Number, // in seconds (for videos)
      default: 0,
    },

    size: {
      type: Number, // file size in bytes
    },

    format: {
      type: String, // mp4, pdf, etc.
    },

    isPreview: {
      type: Boolean,
      default: false, // free preview video
    },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    content: {
      type: String, // rich text content
      default: "",
    },

    order: {
      type: Number,
      required: true,
      index: true,
    },

    lessonType: {
      type: String,
      enum: ["video", "text", "quiz"],
      default: "video",
    },

    totalDuration: {
      type: Number,
      default: 0,
    },

    materials: [materialSchema],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

// Compound index for fast sorting inside course
lessonSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
