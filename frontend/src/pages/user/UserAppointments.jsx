import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        try {
            await api.put(`/appointments/${appointmentId}/cancel`);
            toast.success("Appointment cancelled successfully");
            fetchAppointments(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel appointment.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading your history...</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">My Appointment History</h2>
                <p className="text-on-surface-variant text-base mt-2">Track your past and upcoming consultations.</p>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center bg-white/70 backdrop-blur-xl rounded-2xl text-on-surface-variant py-16 border border-outline-variant/30 font-label-md flex flex-col items-center gap-4 shadow-sm">
                    <span className="material-symbols-outlined text-[48px] text-outline opacity-50">history_toggle_off</span>
                    You haven't booked any appointments yet. Head to the dashboard to find a doctor!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appt) => {
                        const date = new Date(appt.slot_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                        const time = `${appt.start_time.slice(0, 5)} - ${appt.end_time.slice(0, 5)}`;
                        
                        let statusColor = 'bg-surface-container-high text-on-surface';
                        let statusIcon = 'schedule';
                        
                        if (appt.status === 'BOOKED') {
                            statusColor = 'bg-primary-container text-on-primary-container';
                            statusIcon = 'event_available';
                        }
                        else if (appt.status === 'COMPLETED') {
                            statusColor = 'bg-tertiary-container text-on-tertiary-container';
                            statusIcon = 'check_circle';
                        }
                        else if (appt.status === 'CANCELLED') {
                            statusColor = 'bg-error-container text-on-error-container';
                            statusIcon = 'cancel';
                        }

                        return (
                            <div key={appt.appointment_id} className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden">
                                            <span className="material-symbols-outlined text-[28px] text-primary/70">stethoscope</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-headline-sm font-bold text-on-surface line-clamp-1">{appt.doctor_name}</h3>
                                            <p className="text-sm font-label-md text-primary">{appt.specialization}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-xl space-y-3 mb-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[18px] text-outline">calendar_month</span>
                                        <span className="font-body-md text-on-surface">{date}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[18px] text-outline">schedule</span>
                                        <span className="font-body-md text-on-surface">{time}</span>
                                    </div>
                                    <div className="flex items-center gap-3 border-t border-outline-variant/20 pt-3">
                                        <span className="material-symbols-outlined text-[18px] text-outline">payments</span>
                                        <span className="font-label-md font-bold text-on-surface">Total Paid: ₹{appt.total_fee}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusColor}`}>
                                        <span className="material-symbols-outlined text-[14px]">{statusIcon}</span>
                                        <span className="text-[10px] font-label-sm font-bold uppercase tracking-wider">{appt.status}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {appt.status === 'COMPLETED' && (
                                            <button 
                                                onClick={() => navigate(`/user/prescription/${appt.appointment_id}`)}
                                                className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl font-label-md font-semibold hover:bg-secondary hover:text-on-secondary transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">prescriptions</span>
                                                Prescription
                                            </button>
                                        )}

                                        {appt.status === 'BOOKED' && (
                                            <button 
                                                onClick={() => handleCancel(appt.appointment_id)}
                                                className="bg-error/10 text-error px-4 py-2 rounded-xl font-label-md font-semibold hover:bg-error hover:text-on-error transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserAppointments;