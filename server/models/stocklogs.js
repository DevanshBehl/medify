const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    action: { type: String, enum: ['added', 'issued'], required: true },
    quantityChanged: { type: Number, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performedAt: { type: Date, default: Date.now },
    note: { type: String }
});

module.exports = mongoose.model('StockLog', stockLogSchema);
