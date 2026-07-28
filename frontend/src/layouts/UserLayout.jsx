import React from 'react';
import DashboardLayout from './DashboardLayout';

const UserLayout = () => {
    const userLinks = [
        { to: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/user/search', label: 'Find Doctors', icon: 'search' },
        { to: '/user/appointments', label: 'Appointments', icon: 'calendar_today' },
        { to: '/user/profile', label: 'Profile', icon: 'person' },
    ];

    return <DashboardLayout links={userLinks} title="Patient Portal" />;
};

export default UserLayout;