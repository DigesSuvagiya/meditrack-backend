require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const patientRoutes = require('./routes/patient');
const medicinesRoutes = require('./routes/medicines');
const authRoutes = require('./routes/auth'); // Import the auth router

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    credentials: true
}));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // Exit process if connection fails
});

// ✅ Routes
app.use('/api/auth', authRoutes); // Mount the auth router
app.use('/api/patient', patientRoutes); // Patient Routes
app.use('/api/doctor', require('./routes/auth')); // Doctor profile routes in auth.js
app.use('/api/upload', require('./routes/upload'));
app.use('/api/medicines', medicinesRoutes);

// ✅ Default Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
