import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const StatBox = ({ title, value, icon, subtitle, isPrimary }) => (
    <div className={`p-6 rounded-2xl border ${isPrimary ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:-translate-y-1' : 'bg-white/70 backdrop-blur-xl border-outline-variant/30 text-on-surface shadow-sm hover:shadow-md hover:border-primary/30'} flex flex-col justify-between transition-all duration-300 relative overflow-hidden group`}>
        {isPrimary && <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>}
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${isPrimary ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-primary-container text-on-primary-container'}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            {subtitle && (
                <span className={`text-[10px] font-label-sm font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isPrimary ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {subtitle}
                </span>
            )}
        </div>
        <div className="relative z-10">
            <div className={`font-display text-4xl leading-none mb-1 ${isPrimary ? 'text-white' : 'text-on-surface'}`}>{value}</div>
            <div className={`text-sm font-label-md ${isPrimary ? 'text-white/80' : 'text-on-surface-variant'}`}>{title}</div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading Dashboard Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">System Overview</h2>
                    <p className="font-body-lg text-lg text-on-surface-variant max-w-md">Monitor platform activity and growth metrics in real-time.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-outline-variant/30 shadow-sm">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-label-md font-bold text-on-surface uppercase tracking-wider text-[11px]">System Status: Healthy</span>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox 
                    title="Total Revenue" 
                    value={`₹${stats.total_earnings}`} 
                    icon="payments" 
                    subtitle="Platform earnings"
                    isPrimary={true}
                />
                <StatBox 
                    title="Active Patients" 
                    value={stats.total_patients} 
                    icon="group" 
                    subtitle="+12% from last month"
                />
                <StatBox 
                    title="Verified Doctors" 
                    value={stats.total_doctors} 
                    icon="medical_information" 
                    subtitle="4 pending approvals"
                />
                <StatBox 
                    title="Total Appointments" 
                    value={stats.total_appointments} 
                    icon="calendar_month" 
                    subtitle="Across all time"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary text-[24px]">bolt</span>
                    <h3 className="font-headline-md text-xl font-bold text-on-surface">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    
                    {/* Review Doctors */}
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-tertiary/40 transition-colors">
                        <div>
                            <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[24px]">verified_user</span>
                            </div>
                            <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">Review Doctors</h4>
                            <p className="text-sm font-body-md text-on-surface-variant mb-6">Approve or reject new doctor registrations on the platform.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/doctors')}
                            className="w-full py-2.5 rounded-xl font-label-md font-bold border border-tertiary text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all"
                        >
                            Manage Approvals
                        </button>
                    </div>

                    {/* View Appointments */}
                    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-colors">
                        <div>
                            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[24px]">date_range</span>
                            </div>
                            <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">Appointments</h4>
                            <p className="text-sm font-body-md text-on-surface-variant mb-6">View and manage all platform appointments across doctors.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/appointments')}
                            className="w-full py-2.5 rounded-xl font-label-md font-bold border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all"
                        >
                            View Appointments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;