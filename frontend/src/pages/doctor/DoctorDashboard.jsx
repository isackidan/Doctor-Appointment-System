import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [instantConsult, setInstantConsult] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/doctor/appointments');
                setAppointments(response.data.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading your schedule...</p>
        </div>
    );

    const mockAppointments = [
        { id: 1, name: 'Sarah Miller', type: 'Check-up', time: '09:30 AM', status: 'Confirmed', initials: 'SM', color: 'bg-primary-container text-on-primary-container' },
        { id: 2, name: 'James Blackwell', type: 'Consultation', time: '11:00 AM', status: 'In Lobby', initials: 'JB', color: 'bg-tertiary-container text-on-tertiary-container' },
        { id: 3, name: 'Elena Kostic', type: 'Follow-up', time: '01:45 PM', status: 'Pending', initials: 'EK', color: 'bg-secondary-container text-on-secondary-container' },
        { id: 4, name: 'Robert Reed', type: 'Assessment', time: '03:00 PM', status: 'Confirmed', initials: 'RR', color: 'bg-error-container text-on-error-container' },
    ];

    const displayAppointments = appointments.length > 0 ? appointments.map((appt, i) => ({
        id: appt.appointment_id,
        name: appt.patient_name,
        type: 'Consultation',
        time: `${appt.start_time.slice(0, 5)} AM`,
        status: appt.status === 'BOOKED' ? 'Confirmed' : appt.status,
        initials: appt.patient_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        color: ['bg-primary-container text-on-primary-container', 'bg-tertiary-container text-on-tertiary-container', 'bg-secondary-container text-on-secondary-container', 'bg-error-container text-on-error-container'][i % 4]
    })) : mockAppointments;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">
                        Welcome back, {user?.name ? `Dr. ${user.name.split(' ')[0]}` : 'Dr. Aris'}
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant max-w-md">
                        You have {displayAppointments.length} appointments scheduled for today.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Instant Consult Toggle */}
                    <div className="bg-white/70 backdrop-blur-md border border-outline-variant/30 rounded-full py-1.5 px-2 flex items-center gap-3 shadow-sm pr-4">
                        <button 
                            onClick={() => setInstantConsult(!instantConsult)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${instantConsult ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'}`}
                        >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </button>
                        <div>
                            <p className="text-[11px] font-label-sm font-bold uppercase tracking-wider text-on-surface leading-tight">Instant Consult</p>
                            <p className="text-[9px] text-on-surface-variant">{instantConsult ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                    
                    <button className="bg-primary text-white px-6 py-2.5 rounded-full font-label-md font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        New Appointment
                    </button>
                </div>
            </div>

            {/* Top Grid: Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Total Patients */}
                <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                        </div>
                        <span className="text-[11px] font-label-sm font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <div className="font-display text-4xl text-on-surface leading-none mb-1">1,284</div>
                        <div className="text-sm font-label-md text-on-surface-variant">Total Patients Seen</div>
                    </div>
                </div>

                {/* 2. Avg Satisfaction */}
                <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-orange-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <div className="flex text-orange-500 text-[10px]">★★★★★</div>
                    </div>
                    <div>
                        <div className="font-display text-4xl text-on-surface leading-none mb-1">4.9</div>
                        <div className="text-sm font-label-md text-on-surface-variant">Avg. Satisfaction</div>
                    </div>
                </div>

                {/* 3. Availability Rate */}
                <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-secondary/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">event_available</span>
                        </div>
                        <span className="text-[11px] font-label-sm font-bold text-outline uppercase tracking-wider">Last 30d</span>
                    </div>
                    <div>
                        <div className="font-display text-4xl text-secondary leading-none mb-1">94%</div>
                        <div className="text-sm font-label-md text-on-surface-variant">Availability Rate</div>
                    </div>
                </div>

                {/* 4. Monthly Revenue */}
                <div className="bg-primary rounded-2xl p-6 shadow-lg shadow-primary/20 text-on-primary flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[24px]">payments</span>
                        </div>
                        <span className="text-[11px] font-label-sm font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">+8.4%</span>
                    </div>
                    <div className="relative z-10">
                        <div className="font-display text-4xl leading-none mb-1">$12,450</div>
                        <div className="text-sm font-label-md text-white/80">Monthly Revenue</div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Today's Appointments List */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">view_list</span>
                            </div>
                            <h3 className="font-headline-md text-xl font-bold text-on-surface">Today's Appointments</h3>
                        </div>
                        <button className="text-primary font-label-sm font-semibold hover:underline">View Schedule</button>
                    </div>

                    <div className="space-y-2">
                        {displayAppointments.map((appt) => {
                            let badgeStyle = "bg-primary-container text-on-primary-container";
                            if (appt.status === 'In Lobby') badgeStyle = "bg-tertiary-container text-on-tertiary-container";
                            if (appt.status === 'Pending') badgeStyle = "bg-secondary-container text-on-secondary-container";

                            return (
                                <div 
                                    key={appt.id} 
                                    onClick={() => navigate(`/doctor/prescription/${appt.id}`)}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant/20 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${appt.color} font-headline-sm font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                                            {appt.initials}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-label-md font-bold text-on-surface">{appt.name}</h4>
                                            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-0.5">
                                                <span className="font-medium">{appt.type}</span>
                                                <span className="w-1 h-1 bg-outline rounded-full"></span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {appt.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-label-sm font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
                                        {appt.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Earnings Chart & Feedback */}
                <div className="space-y-6">
                    {/* Earnings Overview Card */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-headline-sm text-lg font-bold text-on-surface">Earnings Overview</h3>
                                <div className="text-sm text-on-surface-variant mt-1">This Week</div>
                            </div>
                            <div className="text-right">
                                <div className="font-display text-2xl text-on-surface">$2,840</div>
                                <div className="text-[10px] text-tertiary font-bold uppercase tracking-wider mt-1">+10% VS LAST WEEK</div>
                            </div>
                        </div>

                        {/* Bar chart placeholder visual */}
                        <div className="flex items-end justify-between h-32 pt-4 px-2 border-t border-outline-variant/20">
                            {[
                                { day: 'M', h: 'h-12', c: 'bg-primary/20' },
                                { day: 'T', h: 'h-16', c: 'bg-primary/30' },
                                { day: 'W', h: 'h-24', c: 'bg-primary shadow-sm' },
                                { day: 'T', h: 'h-14', c: 'bg-primary/20' },
                                { day: 'F', h: 'h-20', c: 'bg-primary/40' },
                                { day: 'S', h: 'h-10', c: 'bg-primary/20' },
                                { day: 'S', h: 'h-16', c: 'bg-primary/30' }
                            ].map((bar, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group">
                                    <div className={`w-6 ${bar.c} ${bar.h} rounded-t-md group-hover:bg-primary transition-colors`}></div>
                                    <span className={`text-[10px] font-label-sm ${bar.day === 'W' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{bar.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Patient Feedback */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-headline-sm text-lg font-bold text-on-surface">Patient Feedback</h3>
                            <span className="material-symbols-outlined text-outline">forum</span>
                        </div>
                        
                        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 relative">
                            <span className="material-symbols-outlined absolute -top-3 -left-2 text-primary/20 text-[40px] rotate-180" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                            <div className="flex text-orange-400 text-xs mb-2">★★★★★</div>
                            <p className="text-sm font-body-md text-on-surface italic relative z-10">"Dr. Aris is incredibly thorough and empathetic. The digital follow-up was seamless."</p>
                            <p className="text-[11px] font-label-sm font-bold text-on-surface-variant mt-3 text-right">— Maria D.</p>
                        </div>
                        
                        <button className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface font-label-md font-semibold rounded-xl transition-colors">
                            Read All Reviews
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DoctorDashboard;