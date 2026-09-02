import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User / Patient Pages
import UserDashboard from './pages/user/UserDashboard';
import FindSpecialists from './pages/user/FindSpecialists';
import BookingPage from './pages/user/BookingPage';
import UserAppointments from './pages/user/UserAppointments';
import PatientPrescriptions from './pages/user/PatientPrescriptions';
import PatientLabReports from './pages/user/PatientLabReports';
import PatientBills from './pages/user/PatientBills';
import PatientNotifications from './pages/user/PatientNotifications';
import PatientSettings from './pages/user/PatientSettings';
import ViewPrescription from './pages/user/ViewPrescription';
import ProfilePage from './pages/user/ProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorConsultation from './pages/doctor/DoctorConsultation';
import DoctorSlots from './pages/doctor/DoctorSlots';
import DoctorPrescription from './pages/doctor/DoctorPrescription';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DoctorAppointments from './pages/doctor/DoctorAppointments';

// New Hospital ERP Portals - All 8 Roles Connected
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistPatientManagement from './pages/receptionist/ReceptionistPatientManagement';
import NurseDashboard from './pages/nurse/NurseDashboard';
import NurseQueue from './pages/nurse/NurseQueue';
import NurseVitals from './pages/nurse/NurseVitals';
import NurseMedications from './pages/nurse/NurseMedications';
import NurseInstructions from './pages/nurse/NurseInstructions';
import NurseWards from './pages/nurse/NurseWards';
import NurseNotes from './pages/nurse/NurseNotes';
import LabDashboard from './pages/lab/LabDashboard';
import LabOrders from './pages/lab/LabOrders';
import LabProcessing from './pages/lab/LabProcessing';
import LabResults from './pages/lab/LabResults';
import LabPatientSearch from './pages/lab/LabPatientSearch';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyBilling from './pages/pharmacy/PharmacyBilling';
import MedicineManagement from './pages/pharmacy/MedicineManagement';
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import AccountsBilling from './pages/accounts/AccountsBilling';
import AccountsPayments from './pages/accounts/AccountsPayments';
import AccountsExpenses from './pages/accounts/AccountsExpenses';
import AccountsReports from './pages/accounts/AccountsReports';
import AccountsPatientSearch from './pages/accounts/AccountsPatientSearch';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminUserManagement from './pages/superadmin/AdminUserManagement';
import AdminPatientManagement from './pages/superadmin/AdminPatientManagement';
import AdminDoctorManagement from './pages/superadmin/AdminDoctorManagement';
import AdminNurseManagement from './pages/superadmin/AdminNurseManagement';
import AdminLabManagement from './pages/superadmin/AdminLabManagement';
import AdminPharmacyManagement from './pages/superadmin/AdminPharmacyManagement';
import AdminAccountsManagement from './pages/superadmin/AdminAccountsManagement';
import AdminAppointmentManagement from './pages/superadmin/AdminAppointmentManagement';
import AdminReports from './pages/superadmin/AdminReports';
import AdminAuditLogs from './pages/superadmin/AdminAuditLogs';
import AdminNotifications from './pages/superadmin/AdminNotifications';
import AdminSettings from './pages/superadmin/AdminSettings';
import SuperAdminDepartments from './pages/superadmin/SuperAdminDepartments';
import SuperAdminStaff from './pages/superadmin/SuperAdminStaff';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import NotFoundPage from './pages/error/NotFoundPage';

// Layouts for all 8 Roles
import UserLayout from './layouts/UserLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import NurseLayout from './layouts/NurseLayout';
import LabLayout from './layouts/LabLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import AccountsLayout from './layouts/AccountsLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

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

          {/* 1. PATIENT / USER Routes */}
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['PATIENT', 'SUPER_ADMIN']}>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="appointments" element={<UserAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="lab-reports" element={<PatientLabReports />} />
            <Route path="billing" element={<PatientBills />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="settings" element={<PatientSettings />} />
            <Route path="search" element={<FindSpecialists />} />
            <Route path="book/:doctorId" element={<BookingPage />} />
            <Route path="prescription/:appointmentId" element={<ViewPrescription />} />
          </Route>

          {/* 2. RECEPTIONIST Routes */}
          <Route path="/receptionist" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'SUPER_ADMIN']}>
              <ReceptionistLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="patients" element={<ReceptionistPatientManagement />} />
            <Route path="register-patient" element={<ReceptionistDashboard />} />
          </Route>

          {/* 3. NURSE Routes */}
          <Route path="/nurse" element={
            <ProtectedRoute allowedRoles={['NURSE', 'SUPER_ADMIN']}>
              <NurseLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<NurseDashboard />} />
            <Route path="queue" element={<NurseQueue />} />
            <Route path="vitals" element={<NurseVitals />} />
            <Route path="medications" element={<NurseMedications />} />
            <Route path="instructions" element={<NurseInstructions />} />
            <Route path="wards" element={<NurseWards />} />
            <Route path="notes" element={<NurseNotes />} />
          </Route>

          {/* 4. DOCTOR Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="queue" element={<DoctorQueue />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="consultation/:appointmentId" element={<DoctorConsultation />} />
            <Route path="slots" element={<DoctorSlots />} />
            <Route path="prescription/:appointmentId" element={<DoctorPrescription />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 5. LAB TECHNICIAN Routes */}
          <Route path="/lab" element={
            <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'SUPER_ADMIN']}>
              <LabLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LabDashboard />} />
            <Route path="orders" element={<LabOrders />} />
            <Route path="processing" element={<LabProcessing />} />
            <Route path="results" element={<LabResults />} />
            <Route path="search" element={<LabPatientSearch />} />
          </Route>

          {/* 6. PHARMACY Routes */}
          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['PHARMACY', 'SUPER_ADMIN']}>
              <PharmacyLayout />
            </ProtectedRoute>
          }>
            <Route path="billing" element={<PharmacyBilling />} />
            <Route path="dashboard" element={<PharmacyDashboard />} />
            <Route path="medicines" element={<MedicineManagement />} />
            <Route path="inventory" element={<PharmacyInventory />} />
          </Route>

          {/* 7. ACCOUNTS Routes */}
          <Route path="/accounts" element={
            <ProtectedRoute allowedRoles={['ACCOUNTS', 'SUPER_ADMIN']}>
              <AccountsLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AccountsDashboard />} />
            <Route path="billing" element={<AccountsBilling />} />
            <Route path="payments" element={<AccountsPayments />} />
            <Route path="expenses" element={<AccountsExpenses />} />
            <Route path="reports" element={<AccountsReports />} />
            <Route path="search" element={<AccountsPatientSearch />} />
          </Route>

          {/* 8. SUPER ADMIN Routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="patients" element={<AdminPatientManagement />} />
            <Route path="doctors" element={<AdminDoctorManagement />} />
            <Route path="nurses" element={<AdminNurseManagement />} />
            <Route path="lab" element={<AdminLabManagement />} />
            <Route path="pharmacy" element={<AdminPharmacyManagement />} />
            <Route path="accounts" element={<AdminAccountsManagement />} />
            <Route path="appointments" element={<AdminAppointmentManagement />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="staff" element={<AdminUserManagement />} />
            <Route path="departments" element={<AdminSettings />} />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;