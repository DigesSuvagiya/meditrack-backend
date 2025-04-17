const mongoose = require('mongoose');

// Define User Schema (for both Doctors & Patients)
const userSchema = new mongoose.Schema({
    fullname: { 
        type: String, 
        required: [true, 'Full name is required'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'] 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
        type: String, 
        enum: ["doctor", "patient"], 
        required: [true, 'Role is required'],
        default: 'patient'
    },
    
    // Doctor-specific fields
    lic_no: { 
        type: String, 
        required: function() { return this.role === 'doctor' },
        unique: true,
        sparse: true
    },
    spec: { 
        type: String,
        required: function() { return this.role === 'doctor' }
    },
    experience: { 
        type: Number,
        required: function() { return this.role === 'doctor' }
    },
    bio: { 
        type: String,
        required: function() { return this.role === 'doctor' }
    },

    // Patient-specific fields
    dob: { 
        type: Date,
        required: function() { return this.role === 'patient' }
    },
    gender: { 
        type: String, 
        enum: ["male", "female", "other"],
        required: function() { return this.role === 'patient' }
    },
    bloodGroup: { 
        type: String,
        required: function() { return this.role === 'patient' }
    },
    address: { 
        type: String,
        required: function() { return this.role === 'patient' }
    },
    emergencyContactName: { 
        type: String,
        required: function() { return this.role === 'patient' }
    },
    emergencyContactNumber: { 
        type: String,
        required: function() { return this.role === 'patient' }
    },

    // New doctor profile fields
    profilePhoto: {
        type: String, // URL to the photo from Firebase
        required: false
    },
    hospitalName: {
        type: String,
        required: false
    },
    hospitalAddress: {
        type: String,
        required: false
    },
    consultationFees: {
        type: Number,
        required: false
    },
    officeHours: {
        type: String,
        required: false
    },
    additionalQualifications: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
