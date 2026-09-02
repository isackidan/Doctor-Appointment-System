import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            toast.success(res.data.data?.message || 'Password reset token generated!');
            if (res.data.data?.resetToken) {
                setResetToken(res.data.data.resetToken);
            }
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { resetToken, newPassword });
            toast.success('Password reset successfully! Please sign in.');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-outline-variant/30">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {step === 1 ? (
                    <>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-on-surface">Forgot Password?</h3>
                            <p className="text-xs text-on-surface-variant">Enter your account email to receive a password reset token.</p>
                        </div>

                        <form onSubmit={handleRequestToken} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border p-3 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white p-3 rounded-xl font-bold text-sm">
                                    {loading ? 'Sending...' : 'Get Reset Token'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-on-surface">Reset Password</h3>
                            <p className="text-xs text-on-surface-variant">Enter your reset token and your new password.</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Reset Token</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Paste token here"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    className="w-full border p-3 rounded-xl text-sm font-mono text-xs"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border p-3 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-sm">
                                    {loading ? 'Resetting...' : 'Set New Password'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
