const mongoose = require('mongoose');

const patientCheckSchema = new mongoose.Schema({
    patientId: { type: String, unique: true, required: true },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type:String,
        ref: 'User',
        required: true
    },
    fullname: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    medicalHistory: { type: String },
    allergies: { type: String },
    currentMedications: { type: String },
    chronicConditions: { type: String },
    visitDate: { type: Date, default: Date.now },
    doctorNotes: { type: String },
    vitalSigns: {
        bloodPressure: { type: String },
        heartRate: { type: Number },
        temperature: { type: Number },
        weight: { type: Number },
        height: { type: Number }
    },
    diagnosis: { type: String },
    treatmentPlan: { type: String },
    followUpAppointment: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PatientCheck', patientCheckSchema);