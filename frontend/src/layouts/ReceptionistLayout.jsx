import React from 'react';
import DashboardLayout from './DashboardLayout';

const ReceptionistLayout = () => {
    const links = [
        { to: '/receptionist/dashboard', label: 'Reception Queue & Intake', icon: 'desk' },
        { to: '/receptionist/patients', label: 'Patient Directory', icon: 'badge' },
    ];
    return <DashboardLayout links={links} title="Receptionist Workspace" />;
};

export default ReceptionistLayout;
