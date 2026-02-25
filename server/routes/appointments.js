const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointments');
const Doctor = require('../models/doctors');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (Receptionist)
router.post('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        // Validate slot isn't already booked
        const existing = await Appointment.findOne({
            doctorId: req.body.doctorId,
            appointmentDate: new Date(req.body.appointmentDate).setHours(0, 0, 0, 0),
            timeSlot: req.body.timeSlot,
            status: { $ne: 'cancelled' }
        });

        if (existing) {
            return res.status(400).json({ message: 'Time slot is already booked for this doctor.' });
        }

        const appt = new Appointment(req.body);
        // Normalize date
        appt.appointmentDate = new Date(req.body.appointmentDate).setHours(0, 0, 0, 0);
        const createdAppt = await appt.save();

        res.status(201).json(createdAppt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/appointments
// @desc    Get all appointments (filter by date, doctor, or patient)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.query.doctorId) query.doctorId = req.query.doctorId;
        if (req.query.patientId) query.patientId = req.query.patientId;
        if (req.query.date) {
            query.appointmentDate = new Date(req.query.date).setHours(0, 0, 0, 0);
        }

        // Role-based filtering: doctors see only their own
        if (req.user.role === 'doctor') {
            const doctorProfile = await Doctor.findOne({ userId: req.user._id });
            if (doctorProfile) {
                query.doctorId = doctorProfile._id;
            }
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name contact bloodGroup')
            .populate('doctorId', 'name specialization')
            .sort({ appointmentDate: -1, timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (scheduled -> confirmed -> completed / cancelled)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status, notes, diagnosis } = req.body;
        const appt = await Appointment.findById(req.params.id);

        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        appt.status = status || appt.status;
        if (notes !== undefined) appt.notes = notes;
        if (diagnosis !== undefined) appt.diagnosis = diagnosis;

        const updatedAppt = await appt.save();
        res.json(updatedAppt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
