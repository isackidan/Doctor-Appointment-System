import React from 'react';
import DashboardLayout from './DashboardLayout';

const PharmacyLayout = () => {
    const links = [
        { to: '/pharmacy/billing', label: 'New Bill (POS Counter)', icon: 'point_of_sale' },
        { to: '/pharmacy/dashboard', label: 'Doctor Prescription Queue', icon: 'medication' },
        { to: '/pharmacy/medicines', label: 'Medicine Catalog & CSV Import', icon: 'science' },
        { to: '/pharmacy/inventory', label: 'Stock Batches', icon: 'inventory_2' },
    ];
    return <DashboardLayout links={links} title="Pharmacy Workstation" />;
};

export default PharmacyLayout;
