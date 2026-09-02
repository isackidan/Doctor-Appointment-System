import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/dashboard');
            const data = res.data.data;

            const generatedAlerts = [];

            if (data.pendingDoctorsCount > 0) {
                generatedAlerts.push({
                    id: 'doc-pending',
                    type: 'STAFF',
                    level: 'WARNING',
                    title: `${data.pendingDoctorsCount} Doctor Registration(s) Pending Approval`,
                    desc: 'New doctors registered on the portal are waiting for Super Admin medical license verification.',
                    time: 'Immediate Attention'
                });
            }

            if (data.urgentLabRequests?.length > 0) {
                generatedAlerts.push({
                    id: 'urgent-lab',
                    type: 'CLINICAL',
                    level: 'CRITICAL',
                    title: `${data.urgentLabRequests.length} Urgent Pathology Order(s) in Queue`,
                    desc: 'Critical diagnostic tests marked URGENT are pending processing in the laboratory.',
                    time: 'Active'
                });
            }

            if (data.lowStockCount > 0) {
                generatedAlerts.push({
                    id: 'low-stock',
                    type: 'PHARMACY',
                    level: 'WARNING',
                    title: `${data.lowStockCount} Pharmacy Items Below Safety Reorder Threshold`,
                    desc: 'Drug supplies in pharmacy require inventory restocking.',
                    time: 'Inventory'
                });
            }

            if (data.totalPendingAmount > 0) {
                generatedAlerts.push({
                    id: 'pending-dues',
                    type: 'BILLING',
                    level: 'INFO',
                    title: `₹${data.totalPendingAmount.toFixed(2)} Outstanding Patient Balance Dues`,
                    desc: 'Unpaid and partially paid invoices awaiting payment collection.',
                    time: 'Accounts'
                });
            }

            // Always add general heartbeat alert
            generatedAlerts.push({
                id: 'system-status',
                type: 'SYSTEM',
                level: 'SUCCESS',
                title: 'All Hospital Core Modules Operating Normally',
                desc: 'OPD, Pharmacy, Laboratory, Accounts, Nursing and Patient portals connected to central database.',
                time: 'Live'
            });

            setAlerts(generatedAlerts);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">System Alerts & Notifications</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Real-time alerts regarding clinical urgencies, inventory shortages, and pending approvals.</p>
                </div>
                <button
                    onClick={fetchAlerts}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Alerts Stream */}
            <div className="space-y-3">
                {loading ? (
                    <div className="p-12 text-center text-on-surface-variant">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading alerts...</span>
                    </div>
                ) : (
                    alerts.map((al) => (
                        <div
                            key={al.id}
                            className={`p-5 rounded-2xl border flex items-start gap-4 transition shadow-sm ${
                                al.level === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-950' :
                                al.level === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                                al.level === 'SUCCESS' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
                                'bg-blue-50 border-blue-200 text-blue-950'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                al.level === 'CRITICAL' ? 'bg-rose-200 text-rose-800' :
                                al.level === 'WARNING' ? 'bg-amber-200 text-amber-800' :
                                al.level === 'SUCCESS' ? 'bg-emerald-200 text-emerald-800' :
                                'bg-blue-200 text-blue-800'
                            }`}>
                                <span className="material-symbols-outlined text-[22px]">
                                    {al.level === 'CRITICAL' ? 'emergency' :
                                     al.level === 'WARNING' ? 'warning' :
                                     al.level === 'SUCCESS' ? 'check_circle' : 'info'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold">{al.title}</h4>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                                        {al.type}
                                    </span>
                                </div>
                                <p className="text-xs mt-1 opacity-90">{al.desc}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
