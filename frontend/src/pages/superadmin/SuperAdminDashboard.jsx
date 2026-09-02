import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/dashboard');
            setStats(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load Super Admin metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Patients', value: stats.totalPatients, sub: 'Registered in ERP', icon: 'personal_injury', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', to: '/superadmin/patients' },
        { title: 'Total Doctors', value: stats.totalDoctors, sub: `${stats.pendingDoctorsCount || 0} pending approval`, icon: 'stethoscope', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', to: '/superadmin/doctors' },
        { title: 'Total Nurses', value: stats.totalNurses, sub: 'Active in Wards/OPD', icon: 'clinical_notes', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', to: '/superadmin/nurses' },
        { title: 'Total Staff', value: stats.totalStaff, sub: 'All non-patient users', icon: 'badge', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', to: '/superadmin/users' },
        { title: 'Total Appointments', value: stats.totalAppointments, sub: `${stats.todayAppointments || 0} scheduled today`, icon: 'event_available', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', to: '/superadmin/appointments' },
        { title: 'Pending Lab Tests', value: stats.pendingLabTests, sub: `${stats.urgentLabRequests?.length || 0} marked URGENT`, icon: 'biotech', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', to: '/superadmin/lab' },
        { title: 'Pending Prescriptions', value: stats.pendingPrescriptions, sub: `${stats.lowStockCount || 0} low stock items`, icon: 'medication', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', to: '/superadmin/pharmacy' },
        { title: 'Total Hospital Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: `₹${(stats.totalPendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} pending`, icon: 'payments', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', to: '/superadmin/accounts' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-on-surface tracking-tight">Hospital Executive Command Center</h1>
                    <p className="text-xs text-on-surface-variant mt-1">Centralized operational oversight, clinical metrics, revenue tracking, and audit trail.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/superadmin/users')}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Onboard Staff / User
                    </button>
                    <button
                        onClick={fetchDashboardStats}
                        className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* 8 Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(card.to)}
                        className={`rounded-2xl p-5 border shadow-sm ${card.bg} hover:shadow-md hover:scale-[1.02] transition cursor-pointer flex flex-col justify-between`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">{card.title}</span>
                            <div className="w-9 h-9 rounded-xl bg-white text-on-surface shadow-sm flex items-center justify-center">
                                <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
                            </div>
                        </div>
                        <div className={`mt-3 text-2xl font-black ${card.color}`}>
                            {card.value}
                        </div>
                        <p className="text-[11px] font-semibold text-on-surface-variant/80 mt-1">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Middle Grid: Pending Doctor Approvals & Urgent Lab Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Doctor Approvals */}
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-700">verified_user</span>
                            <h3 className="text-sm font-bold text-on-surface">Pending Doctor Approvals ({stats.pendingDoctorsCount || 0})</h3>
                        </div>
                        <button onClick={() => navigate('/superadmin/doctors')} className="text-xs font-bold text-blue-600 hover:underline">
                            View All Doctors
                        </button>
                    </div>
                    <div className="divide-y divide-outline-variant/10 p-2 overflow-y-auto max-h-72">
                        {stats.pendingDoctors?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-on-surface-variant">All doctor registrations are approved.</div>
                        ) : (
                            stats.pendingDoctors?.map((doc) => (
                                <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-surface-container-lowest transition rounded-xl">
                                    <div>
                                        <p className="text-xs font-bold text-on-surface">{doc.user?.name}</p>
                                        <p className="text-[11px] text-on-surface-variant">{doc.specialization} • {doc.department?.name || 'General'}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/superadmin/doctors')}
                                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                                    >
                                        Review & Approve
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Urgent Lab Test Alerts */}
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-600">emergency</span>
                            <h3 className="text-sm font-bold text-on-surface">Urgent Laboratory Orders ({stats.urgentLabRequests?.length || 0})</h3>
                        </div>
                        <button onClick={() => navigate('/superadmin/lab')} className="text-xs font-bold text-blue-600 hover:underline">
                            Open Lab Monitor
                        </button>
                    </div>
                    <div className="divide-y divide-outline-variant/10 p-2 overflow-y-auto max-h-72">
                        {stats.urgentLabRequests?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-on-surface-variant">No critical urgent lab tests pending.</div>
                        ) : (
                            stats.urgentLabRequests?.map((req) => (
                                <div key={req.id} className="p-3 flex items-center justify-between hover:bg-surface-container-lowest transition rounded-xl">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-on-surface">{req.testName}</p>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-800 animate-pulse">URGENT</span>
                                        </div>
                                        <p className="text-[11px] text-on-surface-variant">Patient: {req.patient?.user?.name} • Dr. {req.doctor?.user?.name}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">{req.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Live System Activity Log Feed */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-700">history</span>
                        <h3 className="text-sm font-bold text-on-surface">System Activity & Audit Log</h3>
                    </div>
                    <button onClick={() => navigate('/superadmin/audit-logs')} className="text-xs font-bold text-blue-600 hover:underline">
                        View Full Audit Trail
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                            <tr>
                                <th className="p-3.5">Timestamp</th>
                                <th className="p-3.5">Action Performed</th>
                                <th className="p-3.5">Module</th>
                                <th className="p-3.5">User Identity</th>
                                <th className="p-3.5">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {stats.recentActivities?.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-container-lowest">
                                    <td className="p-3.5 text-on-surface-variant">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="p-3.5 font-bold text-on-surface">{log.action}</td>
                                    <td className="p-3.5 font-mono text-[11px] text-blue-700">{log.module || 'SYSTEM'}</td>
                                    <td className="p-3.5 font-semibold text-on-surface">{log.user?.name || 'System Auto'}</td>
                                    <td className="p-3.5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container border border-outline-variant/30 text-on-surface">
                                            {log.user?.role || 'SYSTEM'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
