const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema); 