const express = require('express');
const router = express.Router();
const Prescription = require('../models/prescriptions');
const Medicine = require('../models/medicines');
const StockLog = require('../models/stocklogs');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor)
router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
    try {
        // Expected req.body: { appointmentId, medicines: [{ medicineId, quantity, dosageInstructions }] }
        const prescription = new Prescription({
            ...req.body,
            issuedBy: req.user._id
        });
        const createdPrescription = await prescription.save();
        res.status(201).json(createdPrescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/prescriptions/:id/issue
// @desc    Issue medicines against prescription
// @access  Private (Pharmacist, Admin)
router.post('/:id/issue', protect, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        // Deduct stock for each medicine
        for (const item of prescription.medicines) {
            const medicine = await Medicine.findById(item.medicineId);
            if (medicine && medicine.quantityInStock >= item.quantity) {
                medicine.quantityInStock -= item.quantity;
                await medicine.save();

                // Log the stock issue
                await new StockLog({
                    medicineId: medicine._id,
                    action: 'issued',
                    quantityChanged: -item.quantity,
                    performedBy: req.user._id,
                    note: `Issued for prescription ${prescription._id}`
                }).save();
            } else {
                return res.status(400).json({ message: `Insufficient stock for medicine ID ${item.medicineId}` });
            }
        }

        res.json({ message: 'Medicines issued successfully', prescription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
