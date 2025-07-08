
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// profile pic storage
const profilePicStorage = multer.diskStorage({
  destination: './uploads/profilePics',
  filename: (req, file, cb) => {
    cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadProfilePic = multer({ storage: profilePicStorage });    

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
const uploadMaterials = upload.any(); 

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Learnify_Thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 400, crop: 'limit' }],
  },
});

const uploadThumbnail = multer({ storage: thumbnailStorage });

module.exports = {upload , uploadProfilePic , uploadThumbnail};

