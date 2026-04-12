const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();
const bcrypt = require('bcrypt');

// Models
const User = require('./models/users');
const Patient = require('./models/patients');
const Doctor = require('./models/doctors');
const Bed = require('./models/beds');
const Appointment = require('./models/appointments');
const Admission = require('./models/admissions');
const Medicine = require('./models/medicines');
const Prescription = require('./models/prescriptions');
const Bill = require('./models/bills');
const StockLog = require('./models/stocklogs');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to seed data');

        // Clear existing data
        await Promise.all([
            User.deleteMany(), Patient.deleteMany(), Doctor.deleteMany(),
            Bed.deleteMany(), Appointment.deleteMany(), Admission.deleteMany(),
            Medicine.deleteMany(), Prescription.deleteMany(), Bill.deleteMany(),
            StockLog.deleteMany()
        ]);
        console.log('Cleared existing data.');

        // 1. Users (4: admin, receptionist, doctor, pharmacist)
        const hashedPassword = await bcrypt.hash('password123', 10);
        const usersData = [
            { name: 'Admin User', email: 'admin@medify.com', password: hashedPassword, role: 'admin' },
            { name: 'Recp User', email: 'recp@medify.com', password: hashedPassword, role: 'receptionist' },
            { name: 'Doc User', email: 'doctor@medify.com', password: hashedPassword, role: 'doctor' },
            { name: 'Pharm User', email: 'pharm@medify.com', password: hashedPassword, role: 'pharmacist' }
        ];
        const users = await User.insertMany(usersData);
        const doctorUser = users.find(u => u.role === 'doctor');
        const adminUser = users.find(u => u.role === 'admin');

        // 2. Patients (10)
        const patientsData = Array.from({ length: 10 }).map((_, i) => ({
            name: `Patient ${i + 1}`,
            age: 20 + i,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            bloodGroup: ['O+', 'A+', 'B+', 'AB+'][i % 4],
            contact: `987654321${i}`,
            address: `${i} Main St, City`,
            medicalHistory: i % 3 === 0 ? 'Diabetes' : 'None'
        }));
        const patients = await Patient.insertMany(patientsData);

        // 3. Doctors (5)
        // We already have one user for doctor, let's create a few more user accounts for the other 4 doctors to satisfy "5 doctors"
        const extraDocsUser = await User.insertMany([
            { name: 'Doc Cardio', email: 'cardio@medify.com', password: hashedPassword, role: 'doctor' },
            { name: 'Doc Neuro', email: 'neuro@medify.com', password: hashedPassword, role: 'doctor' },
            { name: 'Doc Ortho', email: 'ortho@medify.com', password: hashedPassword, role: 'doctor' },
            { name: 'Doc Peds', email: 'peds@medify.com', password: hashedPassword, role: 'doctor' }
        ]);

        const allDocUsers = [doctorUser, ...extraDocsUser];
        const specializations = ['General Physician', 'Cardiologist', 'Neurologist', 'Orthopedist', 'Pediatrician'];

        const doctorsData = allDocUsers.map((user, i) => ({
            userId: user._id,
            name: user.name,
            specialization: specializations[i],
            contact: `555123450${i}`,
            consultationFee: 500 + (i * 100),
            shiftStart: '09:00',
            shiftEnd: '17:00',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }));
        const doctors = await Doctor.insertMany(doctorsData);

        // 4. Beds (20 across 3 wards)
        const bedTypes = ['General', 'ICU', 'Private'];
        const bedsData = [];
        for (let i = 0; i < 20; i++) {
            bedsData.push({
                wardName: bedTypes[i % 3],
                bedNumber: `${bedTypes[i % 3].charAt(0)}${i + 1}`,
                floor: `${(i % 3) + 1}`,
                status: 'available'
            });
        }
        const beds = await Bed.insertMany(bedsData);

        // 5. Medicines (15)
        const medsData = Array.from({ length: 15 }).map((_, i) => ({
            name: `Medicine ${i + 1}`,
            category: ['Tablet', 'Syrup', 'Injection'][i % 3],
            quantityInStock: i < 3 ? 10 : 100 + i * 10, // First 3 are low stock
            reorderLevel: 20,
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            pricePerUnit: 10 + i * 5
        }));
        const medicines = await Medicine.insertMany(medsData);

        // 6. Appointments (5)
        const appsData = Array.from({ length: 5 }).map((_, i) => ({
            patientId: patients[i]._id,
            doctorId: doctors[i % doctors.length]._id,
            appointmentDate: new Date(),
            timeSlot: `${9 + i}:00`,
            status: 'completed',
            diagnosis: `Diagnosis ${i + 1}`
        }));
        const appointments = await Appointment.insertMany(appsData);

        // 7. Admissions (2)
        const adminData = Array.from({ length: 2 }).map((_, i) => {
            // Allocate beds
            const bed = beds[i];
            bed.status = 'occupied';
            bed.currentPatient = patients[i + 5]._id;
            return {
                patientId: patients[i + 5]._id,
                bedId: bed._id,
                admitDate: new Date(),
                reason: `Reason ${i + 1}`,
                perDayCharge: 1000 + (i * 500)
            };
        });
        const admissions = await Admission.insertMany(adminData);
        // Save bed status
        await beds[0].save();
        await beds[1].save();

        // 8. Bills (2)
        const billsData = [
            {
                patientId: appointments[0].patientId,
                appointmentId: appointments[0]._id,
                consultationFee: doctors[0].consultationFee,
                total: doctors[0].consultationFee,
                paymentStatus: 'paid'
            },
            {
                patientId: appointments[1].patientId,
                appointmentId: appointments[1]._id,
                consultationFee: doctors[1].consultationFee,
                total: doctors[1].consultationFee,
                paymentStatus: 'pending'
            }
        ];
        await Bill.insertMany(billsData);

        console.log('Data Seeded Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error with seed data seeding:', error);
        process.exit(1);
    }
};

seedDB();
