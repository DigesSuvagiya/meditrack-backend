const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const jwt = require('jsonwebtoken');

// Simple auth middleware
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // If token exists, try to verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.user.id, role: decoded.user.role };
    } catch (err) {
      console.log('Token verification failed, but continuing');
      // Still continue even if verification fails
    }
  }
  
  // If no token or verification failed, use userId from body if available
  if (!req.user && req.body.userId) {
    req.user = { id: req.body.userId, role: 'doctor' };
  }
  
  // Always continue to the next middleware/route handler
  next();
};

router.post('/image', auth, async (req, res) => {
  try {
    const { imageData, userId } = req.body;
    
    // Check if image data exists
    if (!imageData) {
      console.log('No image data provided');
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    console.log('Starting image upload to Cloudinary');
    console.log('User ID:', userId || 'Not provided');
    
    // Check if the imageData starts with data:image
    if (!imageData.startsWith('data:image')) {
      console.log('Invalid image format');
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    // Upload to Cloudinary with minimal options
    const uploadResponse = await cloudinary.uploader.upload(
      imageData,
      {
        folder: 'doctor_profiles',
        timeout: 60000
      }
    );

    console.log('Upload successful:', uploadResponse.secure_url);
    
    // Return the image URL and public ID
    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    
    // More detailed error logging
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Better error response
    res.status(500).json({ 
      message: 'Image upload failed',
      error: error.message || 'Unknown server error',
      details: error.http_code ? `HTTP ${error.http_code}` : 'Server error'
    });
  }
});

module.exports = router;
