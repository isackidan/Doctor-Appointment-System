import React from 'react';
import DashboardLayout from './DashboardLayout';

const AccountsLayout = () => {
    const links = [
        { to: '/accounts/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/accounts/billing', label: 'Billing & Invoices', icon: 'receipt_long' },
        { to: '/accounts/payments', label: 'Payments Ledger', icon: 'payments' },
        { to: '/accounts/expenses', label: 'Hospital Expenses', icon: 'trending_down' },
        { to: '/accounts/reports', label: 'Financial Reports', icon: 'bar_chart' },
        { to: '/accounts/search', label: 'Patient Ledger', icon: 'person_search' },
    ];
    return <DashboardLayout links={links} title="Accounts & Finance Portal" />;
};

export default AccountsLayout;
