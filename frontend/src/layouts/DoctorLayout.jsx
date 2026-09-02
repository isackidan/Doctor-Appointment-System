import React from 'react';
import DashboardLayout from './DashboardLayout';

const DoctorLayout = () => {
    const doctorLinks = [
        { to: '/doctor/dashboard', label: 'Dashboard & Stats', icon: 'dashboard' },
        { to: '/doctor/queue', label: 'Live Patient Queue', icon: 'queue' },
        { to: '/doctor/appointments', label: 'My Appointments', icon: 'calendar_month' },
        { to: '/doctor/slots', label: 'Manage Time Slots', icon: 'schedule' },
        { to: '/doctor/profile', label: 'Doctor Profile', icon: 'person' },
    ];

    return <DashboardLayout links={doctorLinks} title="Doctor Workstation" />;
};

export default DoctorLayout;