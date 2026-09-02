import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nurse/queue');
            setQueue(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load triage queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Nurse Triage Patient Queue</h2>
                <p className="font-body-lg text-on-surface-variant mt-1">Checked-in OPD patients awaiting vital signs assessment.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">Triage Queue Matrix ({queue.length})</h3>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {queue.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No patients in triage queue right now.</td></tr>
                            ) : queue.map((row) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NurseQueue;
