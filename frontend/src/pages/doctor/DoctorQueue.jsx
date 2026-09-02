import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorQueue = () => {
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 15000); // Live poll every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await api.get('/doctor/queue');
            setQueue(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCallPatient = async (appointmentId) => {
        try {
            await api.post(`/doctor/appointments/${appointmentId}/start`);
            toast.success('Patient Called into Consultation Room!');
            navigate(`/doctor/consultation/${appointmentId}`);
        } catch (err) {
            toast.error('Failed to call patient');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-teal-900 text-white p-6 md:p-8 rounded-3xl shadow-xl">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Live Patient OPD Queue Terminal</h1>
                    <p className="text-teal-200 text-sm mt-1">Real-time waiting list, token numbers, priority indicators, and calling terminal.</p>
                </div>
                {queue.length > 0 && (
                    <button
                        onClick={() => handleCallPatient(queue[0].id)}
                        className="bg-white text-teal-950 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-xl hover:bg-teal-50 transition-all flex items-center gap-2 animate-bounce"
                    >
                        <span className="material-symbols-outlined text-[24px]">volume_up</span>
                        📢 Call Current Waiting Patient ({queue[0]?.token?.tokenNumber || 'TK-101'})
                    </button>
                )}
            </div>

            {/* Queue Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {queue.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-3xl border text-center text-on-surface-variant font-bold">
                        No patients currently waiting in your OPD queue. ✅
                    </div>
                ) : queue.map((patient, idx) => (
                    <div key={patient.id} className={`bg-white p-5 rounded-3xl border-2 shadow-sm space-y-4 relative overflow-hidden transition-all hover:scale-[1.02] ${
                        idx === 0 ? 'border-teal-500 bg-teal-50/40 ring-4 ring-teal-100' : 'border-outline-variant/30'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span className="px-3.5 py-1 rounded-xl bg-teal-900 text-white font-mono font-extrabold text-lg shadow-sm">
                                {patient.token?.tokenNumber || `TK-${101 + idx}`}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                patient.patient?.isEmergency ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-teal-100 text-teal-800'
                            }`}>
                                {patient.patient?.isEmergency ? '🚨 EMERGENCY' : 'NORMAL'}
                            </span>
                        </div>

                        <div>
                            <div className="font-bold text-base text-on-surface truncate">{patient.patient?.user?.name || 'Walk-in Patient'}</div>
                            <div className="text-xs text-teal-700 font-mono font-bold">{patient.patient?.patientCode || 'PAT-2026-0001'}</div>
                            <div className="text-[11px] text-on-surface-variant mt-1">Slot: {patient.startTime} • Gender: {patient.patient?.gender || 'Male'}</div>
                        </div>

                        <div className="border-t pt-3 flex items-center justify-between">
                            <span className="text-[11px] text-on-surface-variant font-mono">Status: <strong>{patient.status}</strong></span>
                            <button
                                onClick={() => handleCallPatient(patient.id)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                Call Patient
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorQueue;
