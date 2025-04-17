const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import User model
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const crypto = require("crypto");


// Simple auth middleware - replace the external middleware
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

// ✅ Register a User (Doctor or Patient)
router.post('/register', async (req, res) => {
    try {
        // Log incoming request
        console.log('Received registration request:', req.body);

        const { fullname, email, phone, password, role, lic_no, spec, experience, bio, dob, gender, bloodGroup, address, emergencyContactName, emergencyContactNumber } = req.body;

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already registered' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object based on role
        const newUser = new User({
            fullname, email, phone, password: hashedPassword, role,
            ...(role === "doctor" && { lic_no, spec, experience, bio }),
            ...(role === "patient" && { dob, gender, bloodGroup, address, emergencyContactName, emergencyContactNumber })
        });

        // Log the user object being saved
        console.log('Saving new user:', newUser);

        // Save user to database
        await newUser.save();

       
        console.log('Registration successful for:', email);
        res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Login User (Doctor or Patient)
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or role' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                // Return token and user data
                res.json({
                    token,
                    user: {
                        _id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                        phone: user.phone
                    },
                    userRole: user.role
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update doctor profile
router.put('/profile', auth, async (req, res) => {
    try {
        // Get userId from body if not from auth
        const userId = req.user ? req.user.id : req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Log the incoming data
        console.log('Profile update request for user ID:', userId);
        console.log('Request body:', req.body);
        
        // Extract update fields
        const {
            profilePhoto,
            hospitalName,
            hospitalAddress,
            consultationFees,
            officeHours,
            additionalQualifications,
            bio
        } = req.body;
        
        // Create update object and log it
        const updateData = {
            profilePhoto,
            hospitalName,
            hospitalAddress,
            consultationFees,
            officeHours,
            additionalQualifications,
            bio
        };
        
        console.log('Profile fields to update:', updateData);

        // Ensure the image URL is properly captured
        if (profilePhoto) {
            console.log('Image URL to save:', profilePhoto);
        }

        // Find and update the user
        const updatedDoctor = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedDoctor) {
            console.log('Doctor not found with ID:', userId);
            return res.status(404).json({ message: 'Doctor not found' });
        }

        console.log('Doctor profile updated successfully');
        console.log('Updated doctor profile:', updatedDoctor);
        
        res.json(updatedDoctor);
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get doctor profile
router.get('/profile', auth, async (req, res) => {
    try {
        // Get userId from query params or body if not from auth
        const userId = req.user ? req.user.id : (req.query.userId || req.body.userId);
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const doctor = await User.findById(userId).select('-password');
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for doctors
router.get('/doctors/search', async (req, res) => {
    try {
        const { term, specialization } = req.query;
        
        // Build the search query
        const searchQuery = { 
            role: 'doctor',
        };
        
        // Add search filters if provided
        if (term) {
            searchQuery.fullname = { $regex: term, $options: 'i' };
        }
        
        if (specialization && specialization !== '') {
            searchQuery.spec = { $regex: specialization, $options: 'i' };
        }
        
        // Find doctors matching the criteria
        const doctors = await User.find(searchQuery)
            .select('fullname spec experience bio profilePhoto hospitalName consultationFees')
            .limit(10);
        
        res.json(doctors);
    } catch (error) {
        console.error('Error searching doctors:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Book a new appointment
router.post('/appointments', async (req, res) => {
    try {
        const {
            doctorId,
            patientId,
            patientName,
            doctorName,
            patientMobile,
            date,
            status
        } = req.body;

        // Validate required fields
        if (!doctorId || !patientId || !patientName || !patientMobile || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const appointment = new Appointment({
            doctorId,
            patientId,
            patientName,
            doctorName,
            patientMobile,
            date,
            status: status || 'scheduled'
        });

        const savedAppointment = await appointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

// Get appointments by patient ID
router.get('/appointments/patient/:patientId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.patientId })
            .sort({ date: 1 });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// Get appointments by doctor ID
router.get('/appointments/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .sort({ date: 1 });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// Update appointment status
router.patch('/appointments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }
});

// Cancel appointment
router.delete('/appointments/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
});


module.exports = router;

