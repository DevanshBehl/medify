import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Beds from './pages/Beds';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<MainLayout />}>
            {/* Default redirect based on role needs to happen after login, here we just do a simple generic redirect or keep empty */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']} />}>
              <Route path="patients" element={<Patients />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="appointments" element={<Appointments />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
              <Route path="beds" element={<Beds />} />
              <Route path="billing" element={<Billing />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']} />}>
              <Route path="pharmacy" element={<Pharmacy />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
