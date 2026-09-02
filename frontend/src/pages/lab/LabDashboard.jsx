import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LabDashboard = () => {
    const [stats, setStats] = useState({
        pending: 0,
        collected: 0,
        inProgress: 0,
        completed: 0,
        urgent: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/lab/dashboard/stats');
                setStats(res.data.data);
            } catch (err) {
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Pending Orders', value: stats.pending, icon: 'list_alt', color: 'text-warning', bg: 'bg-warning/10', to: '/lab/orders' },
        { title: 'Samples Collected', value: stats.collected, icon: 'bloodtype', color: 'text-primary', bg: 'bg-primary/10', to: '/lab/processing' },
        { title: 'In Progress', value: stats.inProgress, icon: 'science', color: 'text-info', bg: 'bg-info/10', to: '/lab/processing' },
        { title: 'Completed Today', value: stats.completed, icon: 'fact_check', color: 'text-success', bg: 'bg-success/10', to: '/lab/results' },
        { title: 'Urgent Tests', value: stats.urgent, icon: 'emergency', color: 'text-error', bg: 'bg-error/10', to: '/lab/orders' },
    ];

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-headline-md font-bold text-on-surface">Lab Dashboard</h1>
                <p className="text-sm font-body-md text-on-surface-variant">Overview of daily laboratory operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((card, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => navigate(card.to)}
                        className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{card.title}</p>
                                <h3 className={`text-3xl font-headline-lg font-bold ${card.color}`}>{card.value}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-[24px] ${card.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {card.icon}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-headline-sm font-bold text-on-surface">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => navigate('/lab/orders')} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-bold border border-outline-variant/20">
                        <span className="material-symbols-outlined">experiment</span>
                        View Pending Orders
                    </button>
                    <button onClick={() => navigate('/lab/search')} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-bold border border-outline-variant/20">
                        <span className="material-symbols-outlined">manage_search</span>
                        Search Patient History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LabDashboard;
