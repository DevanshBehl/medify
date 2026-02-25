const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null },
    consultationFee: { type: Number, default: 0 },
    medicineCharges: { type: Number, default: 0 },
    bedCharges: { type: Number, default: 0 },
    miscCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'insurance'], default: 'pending' },
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
