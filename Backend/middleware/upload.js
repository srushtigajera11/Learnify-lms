const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

/* =========================================
   COURSE MATERIAL STORAGE
========================================= */

const materialStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "Learnify/CourseMaterials",
      resource_type: isVideo ? "video" : "auto",
      public_id: `${Date.now()}-${file.originalname
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]/g, "")}`, // clean filename
      allowed_formats: isVideo
        ? ["mp4", "mov", "webm", "m4v"]
        : ["pdf", "doc", "docx", "ppt", "pptx", "jpg", "png"],
    };
  },
});

const upload = multer({
  storage: materialStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
});

/* =========================================
   COURSE THUMBNAIL STORAGE
========================================= */

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Learnify/Thumbnails",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 600, height: 400, crop: "limit" },
    ],
  },
});

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = {
  upload,
  uploadThumbnail,
};
