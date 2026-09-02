import React from 'react';
import DashboardLayout from './DashboardLayout';

const NurseLayout = () => {
    const links = [
        { to: '/nurse/dashboard', label: 'Dashboard & Stats', icon: 'dashboard' },
        { to: '/nurse/queue', label: 'Triage Patient Queue', icon: 'queue' },
        { to: '/nurse/vitals', label: 'Vital Signs Tracker', icon: 'monitor_heart' },
        { to: '/nurse/medications', label: 'Medication Admin Log', icon: 'medication' },
        { to: '/nurse/instructions', label: 'Doctor Instructions', icon: 'clinical_notes' },
        { to: '/nurse/wards', label: 'Ward & Bed Management', icon: 'bed' },
        { to: '/nurse/notes', label: 'Nursing Observation Notes', icon: 'note_add' },
    ];

    return <DashboardLayout links={links} title="Nurse Workstation" />;
};

export default NurseLayout;
