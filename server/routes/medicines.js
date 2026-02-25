const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicines');
const StockLog = require('../models/stocklogs');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/medicines
// @desc    Add a new medicine
// @access  Private (Pharmacist, Admin)
router.post('/', protect, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        const createdMedicine = await medicine.save();
        res.status(201).json(createdMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/medicines
// @desc    Get all medicines (supports pagination and alerts)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const medicines = await Medicine.find()
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ name: 1 });

        const count = await Medicine.countDocuments();

        res.json({ medicines, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine info
// @access  Private (Pharmacist, Admin)
router.put('/:id', protect, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        Object.assign(medicine, req.body);
        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/medicines/:id/stock
// @desc    Add stock and log it
// @access  Private (Pharmacist, Admin)
router.post('/:id/stock', protect, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const { quantityAdded, note } = req.body;
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        medicine.quantityInStock += Number(quantityAdded);
        await medicine.save();

        const stockLog = new StockLog({
            medicineId: medicine._id,
            action: 'added',
            quantityChanged: Number(quantityAdded),
            performedBy: req.user._id,
            note
        });
        await stockLog.save();

        res.json(medicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
