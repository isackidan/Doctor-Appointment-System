import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminNurseManagement = () => {
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/nurses');
            setNurses(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load nurses');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Nurse Staff & Clinical Triage Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Monitor hospital nursing staff, ward vitals recording, and duty shifts.</p>
                </div>
                <button
                    onClick={fetchNurses}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Nurses Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Nurse Name</th>
                                <th className="p-4">Email / Login ID</th>
                                <th className="p-4">Phone Number</th>
                                <th className="p-4">Triage Vitals Recorded</th>
                                <th className="p-4">Assigned Shift</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading nurses...</span>
                                    </td>
                                </tr>
                            ) : nurses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                                        No nurses registered in the system.
                                    </td>
                                </tr>
                            ) : (
                                nurses.map((nurse) => (
                                    <tr key={nurse.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-bold text-on-surface flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                                                <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                                            </div>
                                            {nurse.name}
                                        </td>
                                        <td className="p-4 text-on-surface font-mono">{nurse.email}</td>
                                        <td className="p-4 text-on-surface-variant">{nurse.phone || 'N/A'}</td>
                                        <td className="p-4 font-bold text-teal-800">{nurse.vitalsRecordedCount} Vitals Entries</td>
                                        <td className="p-4 text-on-surface">{nurse.shift}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                nurse.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {nurse.isVerified ? 'ACTIVE' : 'SUSPENDED'}
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

export default AdminNurseManagement;
