import React from 'react';
import DashboardLayout from './DashboardLayout';

const SuperAdminLayout = () => {
    const links = [
        { to: '/superadmin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/superadmin/users', label: 'User Management', icon: 'manage_accounts' },
        { to: '/superadmin/patients', label: 'Patient Management', icon: 'personal_injury' },
        { to: '/superadmin/doctors', label: 'Doctor Management', icon: 'stethoscope' },
        { to: '/superadmin/nurses', label: 'Nurse Management', icon: 'clinical_notes' },
        { to: '/superadmin/lab', label: 'Lab Management', icon: 'biotech' },
        { to: '/superadmin/pharmacy', label: 'Pharmacy Management', icon: 'local_pharmacy' },
        { to: '/superadmin/accounts', label: 'Accounts Management', icon: 'account_balance' },
        { to: '/superadmin/appointments', label: 'Appointment Management', icon: 'event_available' },
        { to: '/superadmin/reports', label: 'Centralized Reports', icon: 'analytics' },
        { to: '/superadmin/audit-logs', label: 'Activity / Audit Log', icon: 'history' },
        { to: '/superadmin/notifications', label: 'Notifications & Alerts', icon: 'notifications' },
        { to: '/superadmin/settings', label: 'Hospital Settings', icon: 'settings' },
    ];
    return <DashboardLayout links={links} title="Super Admin Control Tower" />;
};

export default SuperAdminLayout;
