import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/admin/appointments');
                setAppointments(response.data.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter((appt) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            appt.patient_name.toLowerCase().includes(searchLower) ||
            appt.doctor_name.toLowerCase().includes(searchLower) ||
            appt.status.toLowerCase().includes(searchLower)
        );
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading appointments...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">Platform Appointments</h2>
                    <p className="font-body-lg text-lg text-on-surface-variant max-w-md">Monitor and manage all appointments across the Lumina Health platform.</p>
                </div>
                
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        type="text" 
                        placeholder="Search patient, doctor, status..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/70 backdrop-blur-md border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-2.5 pl-11 pr-4 text-on-surface font-body-md transition-all outline-none shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Fee</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {filteredAppointments.map((row) => (
                                <tr key={row.appointment_id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                                                {row.patient_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-label-md font-bold text-on-surface">{row.patient_name}</div>
                                                <div className="text-xs text-on-surface-variant mt-0.5">{row.patient_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-1.5 font-label-md font-semibold text-primary">
                                            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                            {row.doctor_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="font-label-md text-on-surface">{new Date(row.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div className="text-xs text-on-surface-variant mt-0.5">{`${row.start_time.slice(0,5)} - ${row.end_time.slice(0,5)}`}</div>
                                    </td>
                                    <td className="px-6 py-5 align-middle font-label-md font-bold text-on-surface">
                                        ₹{row.total_fee}
                                    </td>
                                    <td className="px-6 py-5 align-middle text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-label-sm font-bold uppercase tracking-wider rounded-full ${
                                            row.status === 'COMPLETED' ? 'bg-tertiary-container text-on-tertiary-container' :
                                            row.status === 'BOOKED' ? 'bg-primary-container text-on-primary-container' :
                                            'bg-error-container text-on-error-container'
                                        }`}>
                                            <span className="material-symbols-outlined text-[14px]">
                                                {row.status === 'COMPLETED' ? 'task_alt' :
                                                 row.status === 'BOOKED' ? 'event_available' :
                                                 'cancel'}
                                            </span>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredAppointments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                                        No appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointments;