import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const firstName = user?.name ? user.name.split(' ')[0] : 'Patient';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">Hello, {firstName}</h2>
                    <p className="font-body-lg text-lg text-on-surface-variant max-w-md">
                        You have an upcoming appointment today. Don't forget to prepare your latest reports.
                    </p>
                </div>
                <div className="bg-primary-fixed text-on-primary-fixed px-6 py-2.5 rounded-full flex items-center gap-2 self-start md:self-auto shadow-sm">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="font-label-md font-medium">Status: Healthy</span>
                </div>
            </section>

            {/* Top Grid: Appointment & Profile Completion */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointment Card */}
                <div className="lg:col-span-2 relative group overflow-hidden bg-primary rounded-2xl p-6 md:p-8 shadow-lg text-on-primary">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-8">
                        <div className="space-y-6 flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">Upcoming Next</span>
                            </div>
                            
                            <div>
                                <h3 className="font-headline-lg text-3xl font-bold mb-3">Telehealth Consultation</h3>
                                <div className="flex flex-wrap items-center gap-4 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                        <span className="font-body-md">Today, In 45 mins</span>
                                    </div>
                                    <div className="w-[1px] h-4 bg-white/30 hidden sm:block"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">video_camera_front</span>
                                        <span className="font-body-md">Video Call</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2 flex flex-wrap gap-3">
                                <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-label-md font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                                    Join Video
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-label-md font-medium border border-white/30 backdrop-blur-sm transition-all">
                                    Reschedule
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-end md:items-center shrink-0">
                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md w-full md:w-auto">
                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/40 shrink-0 bg-white/20">
                                    <span className="material-symbols-outlined text-4xl text-white/70 w-full h-full flex items-center justify-center">person</span>
                                </div>
                                <div>
                                    <p className="font-label-md text-white font-bold text-lg leading-tight">Dr. Jonathan Aris</p>
                                    <p className="font-body-sm text-white/80 mt-0.5">Senior Cardiologist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Completion Tracker */}
                <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-headline-md text-xl font-bold text-on-surface">Profile Health</h4>
                        <span className="text-primary font-bold font-label-md text-lg">85%</span>
                    </div>
                    <div className="relative w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden mb-6">
                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[85%]"></div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-transparent">
                            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-body-sm text-on-surface-variant">Identity Verified</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-transparent">
                            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-body-sm text-on-surface-variant">Basic Details Added</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white border border-outline-variant/50 rounded-xl shadow-sm cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">add_circle</span>
                            <span className="font-body-sm font-medium text-on-surface">Complete Medical History</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Bento Style Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Notifications & Alerts */}
                <div className="md:col-span-2 lg:col-span-2 bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <span className="material-symbols-outlined">notifications_active</span>
                            </div>
                            <h4 className="font-headline-md text-xl font-bold">Recent Updates</h4>
                        </div>
                        <button className="text-primary font-label-sm font-medium hover:underline">View All</button>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-start gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                            <div className="p-2 bg-tertiary/10 text-tertiary rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">science</span>
                            </div>
                            <div>
                                <p className="font-label-md text-on-surface font-semibold mb-1">Lab Results Ready</p>
                                <p className="font-body-sm text-on-surface-variant text-sm mb-2">Your blood panel results from Oct 22 are available.</p>
                                <span className="text-[11px] text-outline font-medium">2 hours ago</span>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                            <div className="p-2 bg-error/10 text-error rounded-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                            </div>
                            <div>
                                <p className="font-label-md text-on-surface font-semibold mb-1">Billing Alert</p>
                                <p className="font-body-sm text-on-surface-variant text-sm mb-2">Insurance claim #8271 has been processed.</p>
                                <span className="text-[11px] text-outline font-medium">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Replacing Vitals) */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate('/user/search')}
                        className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-primary/5 hover:border-primary/20 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[28px]">search</span>
                        </div>
                        <span className="font-label-md font-semibold text-on-surface">Find Doctors</span>
                        <p className="text-xs text-on-surface-variant mt-2 hidden sm:block">Book a new appointment</p>
                    </button>

                    <button 
                        onClick={() => navigate('/user/appointments')}
                        className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center hover:bg-secondary/5 hover:border-secondary/20 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[28px]">history</span>
                        </div>
                        <span className="font-label-md font-semibold text-on-surface">My History</span>
                        <p className="text-xs text-on-surface-variant mt-2 hidden sm:block">View past visits</p>
                    </button>
                </div>

            </div>

            {/* Floating Action Button for Mobile */}
            <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-container-high transition-transform hover:scale-105 z-40">
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>
        </div>
    );
};

export default UserDashboard;