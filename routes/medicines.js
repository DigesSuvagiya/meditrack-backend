const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.get('/search', async (req, res) => {
  console.log('Received search request with params:', req.query);
  const { name } = req.query;
  
  if (!name) {
    console.log('Validation failed: Missing medicine name');
    return res.status(400).json({ error: 'Medicine name is required' });
  }

  const params = {
    engine: 'google',
    q: `list online platform that sell ${name}`,
    gl: 'in',
    hl: 'en',
    api_key: process.env.SERPAPI_KEY
  };

  console.log('Sending to SerpAPI with params:', params);
  console.log('Using API key:', process.env.SERPAPI_KEY);

  try {
    const response = await axios.get('https://serpapi.com/search', { params });
    console.log('SerpAPI response status:', response.status);
    
    const results = response.data.organic_results || [];
    console.log('Number of results:', results.length);
    
    res.json(response.data);
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: "Failed to fetch medicine platforms",
      details: error.message 
    });
  }
});

module.exports = router;
