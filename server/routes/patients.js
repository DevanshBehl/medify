const express = require('express');
const router = express.Router();
const Patient = require('../models/patients');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private (Admin, Receptionist)
router.post('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/patients
// @desc    Get all active patients (with search and pagination)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { bloodGroup: { $regex: req.query.keyword, $options: 'i' } },
                { contact: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        const count = await Patient.countDocuments({ ...keyword, isActive: true });
        const patients = await Patient.find({ ...keyword, isActive: true })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ patients, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/patients/:id
// @desc    Get patient profile (with appointments, admissions, prescriptions, bills)
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient || !patient.isActive) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Populate related data using Mongoose aggregate or multiple find queries
        // Here we use multiple finds for simplicity as requested 'use populate/aggregate'
        const Appointment = require('../models/appointments');
        const Admission = require('../models/admissions');
        const Bill = require('../models/bills');
        const Prescription = require('../models/prescriptions');

        const appointments = await Appointment.find({ patientId: req.params.id }).populate('doctorId', 'name specialization');
        const admissions = await Admission.find({ patientId: req.params.id }).populate('bedId', 'wardName bedNumber floor');

        // Find prescriptions based on appointments
        const appointmentIds = appointments.map(app => app._id);
        const prescriptions = await Prescription.find({ appointmentId: { $in: appointmentIds } }).populate('medicines.medicineId', 'name');

        const bills = await Bill.find({ patientId: req.params.id });

        res.json({
            ...patient._doc,
            appointments,
            admissions,
            prescriptions,
            bills
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/patients/:id
// @desc    Update patient info
// @access  Private (Admin, Receptionist)
router.put('/:id', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            Object.assign(patient, req.body);
            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Soft delete patient
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            patient.isActive = false;
            await patient.save();
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
