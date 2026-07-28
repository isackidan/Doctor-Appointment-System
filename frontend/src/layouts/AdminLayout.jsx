import React from 'react';
import DashboardLayout from './DashboardLayout';

const AdminLayout = () => {
    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/admin/doctors', label: 'Approve Doctors', icon: 'group' },
        { to: '/admin/appointments', label: 'Appointments', icon: 'calendar_today' },
    ];

    return <DashboardLayout links={adminLinks} title="Admin Portal" />;
};

export default AdminLayout;