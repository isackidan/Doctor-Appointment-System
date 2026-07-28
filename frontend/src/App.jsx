import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './pages/user/UserDashboard';
import FindSpecialists from './pages/user/FindSpecialists';
import BookingPage from './pages/user/BookingPage';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import UserAppointments from './pages/user/UserAppointments';
import DoctorPrescription from './pages/doctor/DoctorPrescription';
import ViewPrescription from './pages/user/ViewPrescription';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorSlots from './pages/doctor/DoctorSlots';

// Import Layouts
import UserLayout from './layouts/UserLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 bg-gray-100 min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* USER Routes (Protected) */}
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="search" element={<FindSpecialists />} />
            <Route path="book/:doctorId" element={<BookingPage />} />
            <Route path="appointments" element={<UserAppointments />} />
            <Route path="prescription/:appointmentId" element={<ViewPrescription />} />
          </Route>

          {/* DOCTOR Routes (Protected) */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="slots" element={<DoctorSlots />} />
            <Route path="prescription/:appointmentId" element={<DoctorPrescription />} />
          </Route>

          {/* ADMIN Routes (Protected) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="appointments" element={<AdminAppointments />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;