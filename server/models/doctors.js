const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    contact: { type: String, required: true },
    consultationFee: { type: Number, required: true },
    shiftStart: { type: String, required: true }, // e.g. '09:00'
    shiftEnd: { type: String, required: true }, // e.g. '17:00'
    availableDays: [{ type: String }], // e.g. ['Monday', 'Tuesday']
    leaveDates: [{ type: Date }]
});

module.exports = mongoose.model('Doctor', doctorSchema);
