# Medify - Hospital Resource Management System (HRMS)
A full-stack web application designed for hospitals to manage patients, beds, appointments, pharmacy stocks, and dynamic billing.

## Modules Implemented
1. **Patient Records**: Track patient demographics and health history.
2. **Bed Allocation**: Visual dashboard displaying Green/Red/Yellow wards.
3. **Doctor Schedules**: Filter specialists and mark availability.
4. **Appointments**: Conflict-free slot booking.
5. **Pharmacy**: Low-stock alerts and integrated prescription dispensing.
6. **Billing**: Dynamic generation of final hospital invoices exportable via PDF.
7. **Role-based Auth**: Differentiated access for Admin, Receptionist, Doctor, and Pharmacist.

## Tech Stack
- Frontend: React (Vite+TypeScript), Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express.js
- Database: MongoDB (with Mongoose ODM)
- Tools: JWT Auth, PDFKit for Invoicing

## Setup & Running Locally

1. **Clone & Install Dependencies**
```bash
# Server terminal
cd server
npm install

# Client terminal 
cd client
npm install
```

2. **Configure Database & Environment vars**
- Ensure you have a running instance of MongoDB (`mongodb://localhost:27017/medify` by default)
- Copy `server/.env.example` to `server/.env`

3. **Database Seeding**
```bash
cd server
node seed.js
```

4. **Run Servers**
```bash
# Server terminal
cd server
npm start

# Client terminal
cd client
npm run dev
```

## Demo Credentials
Use these logins to access different parts of the system:
- **Admin**: admin@medify.com | password123
- **Receptionist**: recp@medify.com | password123
- **Doctor**: doctor@medify.com | password123
- **Pharmacist**: pharm@medify.com | password123

## Core Demo Flow Walkthrough
1. Login as `Receptionist`
2. Navigate to **Patients** -> Add new patient
3. Navigate to **Appointments** -> Select patient & available doctor
4. Login as `Admin` or `Receptionist`, Navigate to **Bed Allocation** -> Admit patient
5. Login as `Doctor`, add Medicine Prescriptions on patient notes
6. Login as `Pharmacist`, view Low Stock in **Pharmacy** module, issue requested meds
7. Navigate to **Billing** -> Generate PDF invoice
8. Discharge the patient and verify the bed returns to Green (Available)
