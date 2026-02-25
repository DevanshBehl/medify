const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    wardName: { type: String, required: true },
    bedNumber: { type: String, required: true },
    floor: { type: String, required: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null }
});

module.exports = mongoose.model('Bed', bedSchema);
