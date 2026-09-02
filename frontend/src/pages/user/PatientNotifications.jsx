import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/notifications');
            setNotifications(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/patient/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error('Failed to update notification');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/patient/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            toast.error('Failed to update notifications');
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Patient Notifications</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Stay updated on appointment schedules, diagnostic reports, and medical updates.</p>
                </div>
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-3 py-1.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition"
                        >
                            Mark All as Read
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="p-2 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden divide-y divide-outline-variant/20">
                {loading ? (
                    <div className="p-12 text-center text-on-surface-variant">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading alerts...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">notifications_off</span>
                        <p className="font-bold text-sm">No notifications yet.</p>
                        <p className="text-xs mt-1">You will be notified about upcoming appointments, prescriptions, and lab results here.</p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            className={`p-4 flex items-start justify-between gap-4 transition ${
                                item.isRead ? 'bg-surface opacity-75' : 'bg-cyan-50/50 border-l-4 border-cyan-600'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    item.isRead ? 'bg-surface-container text-on-surface-variant' : 'bg-cyan-100 text-cyan-800'
                                }`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {item.title?.toLowerCase().includes('appointment') ? 'calendar_month' :
                                         item.title?.toLowerCase().includes('lab') ? 'science' :
                                         item.title?.toLowerCase().includes('prescription') ? 'prescriptions' :
                                         item.title?.toLowerCase().includes('bill') ? 'receipt_long' : 'notifications'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface">{item.title}</h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5">{item.message}</p>
                                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {!item.isRead && (
                                <button
                                    onClick={() => handleMarkAsRead(item.id)}
                                    className="text-[11px] font-bold text-cyan-700 hover:underline shrink-0"
                                >
                                    Mark read
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientNotifications;
