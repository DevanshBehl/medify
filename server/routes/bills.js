const express = require('express');
const router = express.Router();
const Bill = require('../models/bills');
const Doctor = require('../models/doctors');
const Appointment = require('../models/appointments');
const Admission = require('../models/admissions');
const Prescription = require('../models/prescriptions');
const Medicine = require('../models/medicines');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/bills/generate
// @desc    Auto-generate a bill
// @access  Private (Receptionist, Admin)
router.post('/generate', protect, authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const { patientId, appointmentId, admissionId, miscCharges = 0 } = req.body;

        let consultationFee = 0;
        let medicineCharges = 0;
        let bedCharges = 0;

        // 1. Consultation Fee
        if (appointmentId) {
            const appt = await Appointment.findById(appointmentId).populate('doctorId');
            if (appt && appt.doctorId) {
                consultationFee = appt.doctorId.consultationFee || 0;
            }

            // 2. Medicine Charges (from prescription linked to appointment)
            const prescription = await Prescription.findOne({ appointmentId });
            if (prescription) {
                for (const item of prescription.medicines) {
                    const med = await Medicine.findById(item.medicineId);
                    if (med) {
                        medicineCharges += (item.quantity * med.pricePerUnit);
                    }
                }
            }
        }

        // 3. Bed Charges
        if (admissionId) {
            const admission = await Admission.findById(admissionId);
            if (admission) {
                const admitDate = new Date(admission.admitDate);
                const dischargeDate = admission.dischargeDate ? new Date(admission.dischargeDate) : new Date();
                const daysStayed = Math.max(1, Math.ceil((dischargeDate - admitDate) / (1000 * 60 * 60 * 24)));
                bedCharges = daysStayed * admission.perDayCharge;
            }
        }

        const total = consultationFee + medicineCharges + bedCharges + miscCharges;

        const bill = new Bill({
            patientId,
            appointmentId,
            admissionId,
            consultationFee,
            medicineCharges,
            bedCharges,
            miscCharges,
            total
        });

        const createdBill = await bill.save();
        res.status(201).json(createdBill);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bills/:id/export
// @desc    Export bill as PDF
// @access  Private
router.get('/:id/export', protect, async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patientId', 'name contact');

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        // Generate PDF
        const doc = new PDFDocument();
        const filename = `bill_${bill._id}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('MEDIFY HOSPITAL - INVOICE', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Bill ID: ${bill._id}`);
        doc.text(`Date: ${new Date(bill.generatedAt).toLocaleDateString()}`);
        doc.text(`Patient Name: ${bill.patientId.name}`);
        doc.text(`Payment Status: ${bill.paymentStatus.toUpperCase()}`);

        doc.moveDown();
        doc.text('--------------------------------------------------');
        doc.moveDown();

        doc.text(`Consultation Fee: $${bill.consultationFee}`);
        doc.text(`Medicine Charges: $${bill.medicineCharges}`);
        doc.text(`Bed Charges: $${bill.bedCharges}`);
        doc.text(`Miscellaneous: $${bill.miscCharges}`);

        doc.moveDown();
        doc.text('--------------------------------------------------');
        doc.fontSize(16).text(`Total Amount: $${bill.total}`);

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
