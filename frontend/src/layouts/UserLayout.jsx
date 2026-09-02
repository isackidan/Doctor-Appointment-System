import React from 'react';
import DashboardLayout from './DashboardLayout';

const UserLayout = () => {
    const userLinks = [
        { to: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/user/profile', label: 'My Profile', icon: 'person' },
        { to: '/user/appointments', label: 'Appointments', icon: 'calendar_today' },
        { to: '/user/prescriptions', label: 'Prescriptions', icon: 'prescriptions' },
        { to: '/user/lab-reports', label: 'Lab Reports', icon: 'science' },
        { to: '/user/billing', label: 'Bills & Payments', icon: 'receipt_long' },
        { to: '/user/notifications', label: 'Notifications', icon: 'notifications' },
        { to: '/user/settings', label: 'Settings', icon: 'settings' },
    ];

    return <DashboardLayout links={userLinks} title="Patient Care Portal" />;
};

export default UserLayout;