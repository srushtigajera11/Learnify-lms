// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // example: 'dabc1234'
  api_key: process.env.CLOUDINARY_API_KEY,       // example: '1234567890'
  api_secret: process.env.CLOUDINARY_API_SECRET, // example: 'abc123secret'
});

module.exports = cloudinary;
