import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayAssigned: 0,
        waitingVitals: 0,
        vitalsRecorded: 0,
        completedTasks: 0,
        emergencyCount: 0,
        emergencyPatients: [],
        criticalVitalsCount: 0,
        criticalVitals: [],
        recentActivity: []
    });
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNurseDashboardData();
    }, []);

    const fetchNurseDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, queueRes] = await Promise.all([
                api.get('/nurse/dashboard'),
                api.get('/nurse/queue')
            ]);
            setStats(statsRes.data.data);
            setQueue(queueRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load Nurse workstation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-rose-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-rose-600/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-rose-200">
                        <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                        Nurse Triage & Clinical Workstation
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Nursing Care & Vital Monitoring</h1>
                    <p className="text-rose-200 text-sm max-w-xl">Patient vital recording, medication administration, doctor instruction tracking, and critical triage alerts.</p>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/nurse/vitals')}
                        className="bg-white text-rose-950 px-5 py-3 rounded-2xl font-extrabold text-sm shadow-lg hover:bg-rose-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_task</span>
                        + Record Vitals & Triage
                    </button>
                </div>
            </div>

            {/* Main Nursing KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Assigned Patients</div>
                    <div className="text-3xl font-extrabold text-rose-700">{stats.todayAssigned || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Awaiting Vitals</div>
                    <div className="text-3xl font-extrabold text-amber-600 animate-pulse">{stats.waitingVitals || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Vitals Recorded</div>
                    <div className="text-3xl font-extrabold text-emerald-600">{stats.vitalsRecorded || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Emergency Triage</div>
                    <div className="text-3xl font-extrabold text-rose-600">{stats.emergencyCount || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Critical Alerts</div>
                    <div className="text-3xl font-extrabold text-purple-700">{stats.criticalVitalsCount || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Completed Tasks</div>
                    <div className="text-3xl font-extrabold text-indigo-700">{stats.completedTasks || 0}</div>
                </div>
            </div>

            {/* Critical Vital Alerts Widget */}
            {stats.criticalVitals?.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                        <span className="material-symbols-outlined text-rose-600 animate-bounce">warning</span>
                        ⚠️ Critical Vital Signs Alert ({stats.criticalVitals.length} Patients Needing Immediate Triage)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stats.criticalVitals.map(v => (
                            <div key={v.id} className="p-3 bg-white rounded-2xl border border-rose-200 text-xs flex justify-between items-center font-mono">
                                <div>
                                    <div className="font-bold text-rose-950 font-sans">{v.patient?.user?.name}</div>
                                    <div className="text-rose-700">SpO2: {v.spo2}% • Temp: {v.temperature}°F • BP: {v.bloodPressure}</div>
                                </div>
                                <button onClick={() => navigate('/nurse/vitals')} className="bg-rose-600 text-white px-3 py-1 rounded-xl font-bold">Re-check</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Triage Queue Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden space-y-4">
                <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                    <div>
                        <h3 className="font-headline-sm text-xl font-bold text-on-surface">Live Nursing Triage Queue ({queue.length})</h3>
                        <p className="text-xs text-on-surface-variant">Patients checked in by reception awaiting vital signs check.</p>
                    </div>
                    <button onClick={() => navigate('/nurse/vitals')} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700">
                        + Record Vitals
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Token #</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Assigned Doctor</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Triage Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {queue.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-mono font-extrabold text-rose-900">
                                        {row.token?.tokenNumber || 'TK-101'}
                                    </td>
                                    <td className="p-4 font-bold text-on-surface">
                                        {row.patient?.user?.name}
                                        <div className="text-xs text-rose-700 font-mono">{row.patient?.patientCode}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-on-surface text-xs">
                                        Dr. {row.doctor?.user?.name}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            row.patient?.isEmergency ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {row.patient?.isEmergency ? 'EMERGENCY' : 'NORMAL'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => navigate('/nurse/vitals')}
                                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                                            Record Vitals
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

export default NurseDashboard;
