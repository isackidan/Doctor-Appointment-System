import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserAppointments = () => {
    const [appointments, setAppointments] = useState({ upcoming: [], previous: [], all: [] });
    const [tab, setTab] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/appointments');
            setAppointments(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const activeList = tab === 'upcoming' ? appointments.upcoming : appointments.previous;

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">My Appointments</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Track your upcoming consultations and past medical visits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/user/search')}
                        className="px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Book New Appointment
                    </button>
                    <button
                        onClick={fetchAppointments}
                        className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface-container rounded-2xl max-w-xs">
                <button
                    onClick={() => setTab('upcoming')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tab === 'upcoming' ? 'bg-surface text-cyan-800 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">upcoming</span>
                    Upcoming ({appointments.upcoming?.length || 0})
                </button>
                <button
                    onClick={() => setTab('previous')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tab === 'previous' ? 'bg-surface text-cyan-800 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Previous ({appointments.previous?.length || 0})
                </button>
            </div>

            {/* Appointments Table / Cards */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Doctor</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Token #</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading appointments...</span>
                                    </td>
                                </tr>
                            ) : activeList?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">event_busy</span>
                                        <p className="font-bold">No {tab} appointments found.</p>
                                        {tab === 'upcoming' && (
                                            <button
                                                onClick={() => navigate('/user/search')}
                                                className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition"
                                            >
                                                Find a Doctor & Book Now
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                activeList?.map((appt) => {
                                    const isDone = ['TREATMENT_COMPLETED', 'PAYMENT_COMPLETED'].includes(appt.status);
                                    const isCancelled = appt.status === 'CANCELLED';

                                    return (
                                        <tr key={appt.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 text-on-surface">
                                                <p className="font-bold">{new Date(appt.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-on-surface-variant">{appt.startTime} - {appt.endTime}</p>
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">
                                                Dr. {appt.doctor?.user?.name}
                                                <p className="text-[10px] font-normal text-on-surface-variant">{appt.doctor?.specialization}</p>
                                            </td>
                                            <td className="p-4 text-on-surface">
                                                {appt.department?.name || 'General OPD'}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-cyan-700">
                                                {appt.token?.tokenNumber || 'Queue #'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    isDone ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                    isCancelled ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                                    'bg-cyan-100 text-cyan-800 border-cyan-200'
                                                }`}>
                                                    {appt.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {appt.prescription && (
                                                    <button
                                                        onClick={() => navigate('/user/prescriptions')}
                                                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                                                    >
                                                        Prescription
                                                    </button>
                                                )}
                                                {appt.invoice && (
                                                    <button
                                                        onClick={() => navigate('/user/billing')}
                                                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition"
                                                    >
                                                        Bill
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserAppointments;