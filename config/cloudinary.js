// Backend/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Make sure environment variables are loaded
dotenv.config();

// Log config to debug
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary Configuration:');
console.log('Cloud Name:', cloudName ? 'Provided' : 'MISSING');
console.log('API Key:', apiKey ? 'Provided' : 'MISSING');
console.log('API Secret:', apiSecret ? 'Provided' : 'MISSING');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('WARNING: Missing Cloudinary credentials in .env file');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;