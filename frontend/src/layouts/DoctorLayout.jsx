import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Calendar, Clock } from 'lucide-react';

const DoctorLayout = () => {
    const doctorLinks = [
        { to: '/doctor/dashboard', label: 'My Appointments', icon: Calendar },
        { to: '/doctor/slots', label: 'Manage Slots', icon: Clock },
    ];

    return <DashboardLayout links={doctorLinks} title="Doctor Portal" />;
};

export default DoctorLayout;