const express = require('express');
const router = express.Router();
const Admission = require('../models/admissions');
const Bed = require('../models/beds');
const Patient = require('../models/patients');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/admissions
// @desc    Admit a patient
// @access  Private (Admin, Receptionist)
router.post('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const { patientId, bedId, admitDate, reason, perDayCharge } = req.body;

        const bed = await Bed.findById(bedId);
        if (!bed || bed.status !== 'available') {
            return res.status(400).json({ message: 'Bed is not available' });
        }

        const admission = new Admission({
            patientId,
            bedId,
            admitDate,
            reason,
            perDayCharge
        });

        const createdAdmission = await admission.save();

        bed.status = 'occupied';
        bed.currentPatient = patientId;
        await bed.save();

        res.status(201).json(createdAdmission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/admissions/:id/discharge
// @desc    Discharge a patient
// @access  Private (Admin, Receptionist)
router.put('/:id/discharge', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) return res.status(404).json({ message: 'Admission not found' });
        if (admission.dischargeDate) return res.status(400).json({ message: 'Patient is already discharged' });

        admission.dischargeDate = req.body.dischargeDate || new Date();
        await admission.save();

        const bed = await Bed.findById(admission.bedId);
        if (bed) {
            bed.status = 'available';
            bed.currentPatient = null;
            await bed.save();
        }

        res.json(admission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admissions
// @desc    Get admissions history
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const admissions = await Admission.find()
            .populate('patientId', 'name contact bloodGroup')
            .populate('bedId', 'wardName bedNumber floor')
            .sort({ admitDate: -1 });
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
