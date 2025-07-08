const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary'); // your cloudinary config

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'Learnify_Course_Materials',
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: file.mimetype.startsWith('video') ? 'video' : 'auto',
    };
  },
});

const upload = multer({ storage });

// Middleware that accepts any fields (dynamic file keys)
const uploadMaterials = upload.any(); // this accepts all files regardless of field name

module.exports = uploadMaterials;
