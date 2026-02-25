const express = require('express');
const router = express.Router();
const Patient = require('../models/patients');
const Bed = require('../models/beds');
const Appointment = require('../models/appointments');
const Medicine = require('../models/medicines');
const Bill = require('../models/bills');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get aggregated stats for Admin Dashboard
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Patients registered today & this month
        const patientsToday = await Patient.countDocuments({ createdAt: { $gte: today } });
        const patientsThisMonth = await Patient.countDocuments({ createdAt: { $gte: firstDayOfMonth } });

        // Beds availability
        const beds = await Bed.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const bedStats = { available: 0, occupied: 0, maintenance: 0 };
        beds.forEach(b => bedStats[b._id] = b.count);

        // Today's appointments count
        const appointmentsToday = await Appointment.countDocuments({ appointmentDate: today });

        // Low stock medicines
        const lowStockMeds = await Medicine.find({
            $expr: { $lte: ['$quantityInStock', '$reorderLevel'] }
        });
        const lowStockCount = lowStockMeds.length;

        // Pending bills total using aggregate
        const pendingBillsResult = await Bill.aggregate([
            { $match: { paymentStatus: 'pending' } },
            { $group: { _id: null, totalString: { $sum: '$total' } } }
        ]);
        const pendingBillsTotal = pendingBillsResult.length > 0 ? pendingBillsResult[0].totalString : 0;

        res.json({
            patients: {
                today: patientsToday,
                thisMonth: patientsThisMonth
            },
            beds: bedStats,
            appointmentsToday,
            lowStockCount,
            pendingBillsTotal
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
