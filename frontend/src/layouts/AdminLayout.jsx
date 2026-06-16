import React from 'react';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Users, Calendar } from 'lucide-react';

const AdminLayout = () => {
    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/doctors', label: 'Approve Doctors', icon: Users },
        { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    ];

    return <DashboardLayout links={adminLinks} title="Admin Portal" />;
};

export default AdminLayout;