import React from 'react';
import DashboardLayout from './DashboardLayout';

const LabLayout = () => {
    const links = [
        { to: '/lab/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/lab/orders', label: 'Lab Test Orders', icon: 'list_alt' },
        { to: '/lab/processing', label: 'Test Processing', icon: 'science' },
        { to: '/lab/results', label: 'Results', icon: 'fact_check' },
        { to: '/lab/search', label: 'Patient Search', icon: 'search' },
    ];
    return <DashboardLayout links={links} title="Lab Technician Portal" />;
};

export default LabLayout;
