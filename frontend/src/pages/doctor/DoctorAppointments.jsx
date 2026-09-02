import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [dateFilter, setDateFilter] = useState('TODAY');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [dateFilter, statusFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                dateFilter,
                ...(statusFilter ? { status: statusFilter } : {})
            });
            const res = await api.get(`/doctor/appointments?${params.toString()}`);
            setAppointments(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">My Doctor Appointments</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Calendar & list schedule view with patient status controls.</p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                    {['TODAY', 'TOMORROW', 'THIS_WEEK', 'ALL'].map(f => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                dateFilter === f ? 'bg-teal-700 text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-teal-100'
                            }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border-2 p-2 rounded-xl text-xs font-bold text-teal-900 bg-white outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="CHECKED_IN">Waiting (Checked In)</option>
                    <option value="IN_CONSULTATION">In Consultation</option>
                    <option value="TREATMENT_COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                </select>
            </div>

            {/* Appointments List */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">Scheduled OPD Appointments ({appointments.length})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Token #</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Slot Date & Time</th>
                                <th className="p-4">Reason / Complaints</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Consultation Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {appointments.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">No appointments found for selected filter.</td></tr>
                            ) : appointments.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-mono font-extrabold text-teal-800">
                                        {row.token?.tokenNumber || 'TK-101'}
                                    </td>
                                    <td className="p-4 font-bold text-on-surface">
                                        {row.patient?.user?.name || 'Walk-in Patient'}
                                        <div className="text-xs text-teal-700 font-mono">{row.patient?.patientCode}</div>
                                    </td>
                                    <td className="p-4 text-xs font-mono font-bold">
                                        {new Date(row.date).toLocaleDateString()} @ {row.startTime}
                                    </td>
                                    <td className="p-4 text-xs">
                                        {row.reason || 'General OPD Examination'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-900 border border-teal-300">
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => navigate(`/doctor/consultation/${row.id}`)}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                            Consult Patient
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

export default DoctorAppointments;
