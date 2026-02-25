const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantityInStock: { type: Number, required: true },
    reorderLevel: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    pricePerUnit: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);
