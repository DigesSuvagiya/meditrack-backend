const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PatientCheck = require('../models/PatientCheck'); // Import the PatientCheck model

const generateUniqueId = () => {
    return Math.floor(10000 + Math.random() * 90000);
};

// Single GET route for profile using phone number
router.get('/profile', async (req, res) => {
    console.log('Received request with params:', req.query); // Log incoming request parameters
    try {
        const { phone, userId } = req.query; // Get phone number and userId from query params
        
        if (!phone && !userId) {
            return res.status(400).json({ message: 'Phone number or User ID is required' });
        }

        let patient;
        if (userId) {
            patient = await User.findById(userId).select('-password'); // Find user by userId
        } else {
            patient = await User.findOne({ phone }).select('-password'); // Find user by phone number
        }

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get a patient by ID
router.get('/:id', async (req, res) => {
    try {
        const patient = await PatientCheck.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving patient', error });
    }
});

// Route to add a new patient
router.post('/add', async (req, res) => {
    try {
        const {
            fullname,
            dob,
            gender,
            phone,
            email,
            doctorId,  // Get doctorId from request body
            doctorName,
            address,
            emergencyContactName,
            emergencyContactNumber,
            medicalHistory,
            allergies,
            currentMedications,
            chronicConditions,
            visitDate,
            doctorNotes,
            vitalSigns,
            diagnosis,
            treatmentPlan,
            followUpAppointment
        } = req.body;

        // Validate required fields
        if (!fullname || !dob || !gender || !phone || !email || !doctorId || !doctorName) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Create a new patient instance
        const newPatient = new PatientCheck({
            patientId: generateUniqueId(),
            doctorId,  // Use the doctorId from request body
            doctorName,
            fullname,
            dob,
            gender,
            phone,
            email,
            address,
            emergencyContactName,
            emergencyContactNumber,
            medicalHistory,
            allergies,
            currentMedications,
            chronicConditions,
            visitDate,
            doctorNotes,
            vitalSigns,
            diagnosis,
            treatmentPlan,
            followUpAppointment
        });

        await newPatient.save();
        res.status(201).json({ message: 'Patient added successfully!', patient: newPatient });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ message: 'Error adding patient', error: error.message });
    }
});

// Route to delete a patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await PatientCheck.findByIdAndDelete(req.params.id); // Find and delete the patient by ID
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ message: 'Error deleting patient', error });
    }
});


// Route to get all patients for a specific doctor
router.get('/doctor-patients/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        console.log('Fetching patients for doctor:', doctorId); // Add this for debugging
        
        const patients = await PatientCheck.find({ doctorId });
        console.log('Found patients:', patients); // Add this for debugging
        
        res.json(patients);
    } catch (error) {
        console.error('Error fetching doctor\'s patients:', error);
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});

// Route to get all patients' health information by phone number
router.get('/health-summary/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        console.log('Fetching patient health info for phone:', phone);
        
        const patients = await PatientCheck.find({ phone: phone });
        console.log('Found patients:', patients);
        
        if (!patients || patients.length === 0) {
            return res.status(404).json({ message: 'No patients found with this phone number' });
        }
        
        // Add vitalSigns to the healthSummaries
        const healthSummaries = patients.map(patient => ({
            fullname: patient.fullname,
            dob: patient.dob,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            medicalHistory: patient.medicalHistory,
            allergies: patient.allergies,
            currentMedications: patient.currentMedications,
            chronicConditions: patient.chronicConditions,
            lastVisitDate: patient.visitDate,
            emergencyContactName: patient.emergencyContactName,
            emergencyContactNumber: patient.emergencyContactNumber,
            doctorName: patient.doctorName,
            patientId: patient.patientId,
            diagnosis: patient.diagnosis,
            followUp: patient.followUpAppointment,
            vitalSigns: patient.vitalSigns
        }));
        
        console.log('Sending health summaries:', healthSummaries);
        res.json(healthSummaries);
    } catch (error) {
        console.error('Error fetching patient health summaries:', error);
        res.status(500).json({ message: 'Error fetching health summaries', error: error.message });
    }
});

module.exports = router; 