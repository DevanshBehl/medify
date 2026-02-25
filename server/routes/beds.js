const express = require('express');
const router = express.Router();
const Bed = require('../models/beds');
const Admission = require('../models/admissions');
const Patient = require('../models/patients');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/beds
// @desc    Get all beds (Dashboard view)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = req.query.wardName ? { wardName: req.query.wardName } : {};
        const beds = await Bed.find(query).populate('currentPatient', 'name');
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/beds
// @desc    Add a new bed
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const bed = new Bed(req.body);
        const createdBed = await bed.save();
        res.status(201).json(createdBed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/beds/:id/allocate
// @desc    Allocate bed on admission
// @access  Private (Receptionist, Admin)
router.put('/:id/allocate', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const { patientId } = req.body;
        const bed = await Bed.findById(req.params.id);

        if (!bed || bed.status !== 'available') {
            return res.status(400).json({ message: 'Bed is not available' });
        }

        bed.status = 'occupied';
        bed.currentPatient = patientId;
        await bed.save();

        res.json(bed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/beds/:id/release
// @desc    Release bed on discharge
// @access  Private (Receptionist, Admin)
router.put('/:id/release', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id);
        if (!bed || bed.status === 'available') {
            return res.status(400).json({ message: 'Bed is already available' });
        }

        bed.status = 'available';
        bed.currentPatient = null;
        await bed.save();

        res.json(bed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
