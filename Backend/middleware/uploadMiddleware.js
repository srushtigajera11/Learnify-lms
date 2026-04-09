
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Learnify_Thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 400, crop: 'limit' }],
  },
});

const uploadThumbnail = multer({ storage: thumbnailStorage });

module.exports = { uploadThumbnail };

