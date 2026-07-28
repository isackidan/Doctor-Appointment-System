import React from 'react';
import DashboardLayout from './DashboardLayout';

const DoctorLayout = () => {
    const doctorLinks = [
        { to: '/doctor/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/doctor/slots', label: 'Manage Slots', icon: 'schedule' },
    ];

    return <DashboardLayout links={doctorLinks} title="Doctor Portal" />;
};

export default DoctorLayout;