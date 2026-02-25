const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctors');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/doctors
// @desc    Add a new doctor
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        const createdDoctor = await doctor.save();
        res.status(201).json(createdDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/doctors
// @desc    Get all doctors (with filters for availability)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.query.specialization) query.specialization = req.query.specialization;
        if (req.query.date) {
            const targetDate = new Date(req.query.date);
            const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
            // targetDate inside leaveDates or unavabilable days filtering could be done here or on frontend.
            query.availableDays = dayName;
        }

        const doctors = await Doctor.find(query).populate('userId', 'name email');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor info
// @access  Private (Admin, Doctor)
router.put('/:id', protect, authorize('admin', 'doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // If it's a doctor editing, ensure they own the profile
        if (req.user.role === 'doctor' && doctor.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this profile' });
        }

        Object.assign(doctor, req.body);
        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
