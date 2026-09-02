import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/audit-logs?limit=100');
            setLogs(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">System Activity & Audit Trail</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Comprehensive chronological log of all administrative, clinical, and financial actions.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Module</th>
                                <th className="p-4">Actor (User)</th>
                                <th className="p-4">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading audit logs...</span>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-on-surface-variant">
                                        No audit activities recorded.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface-variant font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">{log.action}</td>
                                        <td className="p-4 font-mono text-[11px] text-blue-700">{log.module || 'SYSTEM'}</td>
                                        <td className="p-4 font-bold text-on-surface">
                                            {log.user?.name || 'System Automated'}
                                            <p className="text-[10px] text-on-surface-variant font-normal">{log.user?.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-container border border-outline-variant/30 text-on-surface">
                                                {log.user?.role || 'SYSTEM'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAuditLogs;
