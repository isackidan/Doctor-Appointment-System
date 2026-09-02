import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientSettings = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [updating, setUpdating] = useState(false);

    // Notification Toggles
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifySMS, setNotifySMS] = useState(true);
    const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirmation do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setUpdating(true);
            await api.put('/patient/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-on-surface">Account & Security Settings</h1>
                <p className="text-xs text-on-surface-variant mt-0.5">Manage your patient account security, notification alerts, and login session.</p>
            </div>

            {/* 1. Change Password */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="material-symbols-outlined text-cyan-700">lock_reset</span>
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Change Account Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
                    <div>
                        <label className="font-bold block mb-1 text-on-surface">Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1 text-on-surface">New Password</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1 text-on-surface">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-xs hover:bg-cyan-700 transition shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px]">key</span>
                        {updating ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* 2. Notification Preferences */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="material-symbols-outlined text-cyan-700">tune</span>
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Notification Preferences</h3>
                </div>

                <div className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition">
                        <div>
                            <p className="font-bold text-on-surface">Email Appointment Reminders</p>
                            <p className="text-[10px] text-on-surface-variant">Receive automated reminder emails 24 hours prior to visit.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.checked)}
                            className="w-4 h-4 text-cyan-600 rounded focus:ring-0"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition">
                        <div>
                            <p className="font-bold text-on-surface">SMS Queue & Lab Result Alerts</p>
                            <p className="text-[10px] text-on-surface-variant">Get instant SMS updates when lab reports or prescriptions are ready.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifySMS}
                            onChange={(e) => setNotifySMS(e.target.checked)}
                            className="w-4 h-4 text-cyan-600 rounded focus:ring-0"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition">
                        <div>
                            <p className="font-bold text-on-surface">WhatsApp Health Updates</p>
                            <p className="text-[10px] text-on-surface-variant">Receive digital prescriptions and invoice copies on WhatsApp.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifyWhatsApp}
                            onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                            className="w-4 h-4 text-cyan-600 rounded focus:ring-0"
                        />
                    </label>
                </div>
            </div>

            {/* 3. Account Session & Logout */}
            <div className="bg-surface rounded-2xl p-6 border border-rose-200 bg-rose-50/30 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-rose-900">Sign Out of Patient Portal</h3>
                    <p className="text-xs text-rose-700/80 mt-0.5">Logged in as: <span className="font-bold">{user?.email || 'patient'}</span></p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout Securely
                </button>
            </div>
        </div>
    );
};

export default PatientSettings;
