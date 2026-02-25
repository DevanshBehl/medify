const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    bedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
    admitDate: { type: Date, required: true },
    dischargeDate: { type: Date },
    reason: { type: String, required: true },
    perDayCharge: { type: Number, required: true }
});

module.exports = mongoose.model('Admission', admissionSchema);
