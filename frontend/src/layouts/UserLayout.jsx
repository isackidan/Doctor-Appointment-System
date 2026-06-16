import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Search, CalendarHeart } from 'lucide-react';

const UserLayout = () => {
    const userLinks = [
        { to: '/user/dashboard', label: 'Find Doctors', icon: Search },
        { to: '/user/appointments', label: 'My Appointments', icon: CalendarHeart },
    ];

    return <DashboardLayout links={userLinks} title="Patient Portal" />;
};

export default UserLayout;