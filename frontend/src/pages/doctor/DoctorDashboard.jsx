import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayAppointments: 0,
        waitingPatients: 0,
        inConsultation: 0,
        completedConsultations: 0,
        emergencyCases: 0,
        pendingLabReports: 0,
        followupsCount: 0,
        followups: []
    });
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, queueRes] = await Promise.all([
                api.get('/doctor/dashboard'),
                api.get('/doctor/queue')
            ]);
            setStats(statsRes.data.data);
            setQueue(queueRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load Doctor dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-teal-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-teal-600/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-teal-200">
                        <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                        Doctor Clinical Workspace
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Outpatient Consultation Terminal</h1>
                    <p className="text-teal-200 text-sm max-w-xl">OPD queue management, EHR 360° records, prescription builder, and lab result review.</p>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/doctor/queue')}
                        className="bg-white text-teal-950 px-5 py-3 rounded-2xl font-extrabold text-sm shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">queue</span>
                        Open Patient Queue
                    </button>
                </div>
            </div>

            {/* Clinical KPIs Grid (Section 1) */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Today's OPD</div>
                    <div className="text-3xl font-extrabold text-teal-700">{stats.todayAppointments || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Waiting Patients</div>
                    <div className="text-3xl font-extrabold text-amber-600 animate-pulse">{stats.waitingPatients || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">In Consultation</div>
                    <div className="text-3xl font-extrabold text-blue-600">{stats.inConsultation || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Completed</div>
                    <div className="text-3xl font-extrabold text-emerald-600">{stats.completedConsultations || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Emergency Cases</div>
                    <div className="text-3xl font-extrabold text-rose-600">{stats.emergencyCases || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Pending Lab Reports</div>
                    <div className="text-3xl font-extrabold text-purple-700">{stats.pendingLabReports || 0}</div>
                </div>
            </div>

            {/* Waiting Patients Queue Matrix (Section 3) */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-600 text-[24px]">group</span>
                            Active OPD Waiting Queue ({queue.length})
                        </h3>
                        <p className="text-xs text-on-surface-variant">Checked-in patients awaiting consultation.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Token #</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Appointment Time</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {queue.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No waiting patients in queue right now.</td></tr>
                            ) : queue.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-xl bg-teal-900 text-white font-mono font-extrabold text-sm">
                                            {row.token?.tokenNumber || 'TK-101'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-on-surface">
                                        {row.patient?.user?.name || 'Walk-in Patient'}
                                        <div className="text-xs text-teal-700 font-mono">{row.patient?.patientCode || 'PAT-2026-0001'}</div>
                                    </td>
                                    <td className="p-4 text-xs font-mono font-bold text-on-surface-variant">
                                        {row.startTime}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => navigate(`/doctor/consultation/${row.id}`)}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                            Start Consultation
                                        </button>
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

export default DoctorDashboard;