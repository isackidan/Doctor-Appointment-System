import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import toast from 'react-hot-toast';

const ROLES_LIST = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', icon: 'shield_person', email: 'superadmin@hospital.com', theme: 'blue', btnBg: 'bg-blue-600 hover:bg-blue-700 text-white', badgeBg: 'bg-blue-100 text-blue-900 border-blue-300' },
    { id: 'RECEPTIONIST', label: 'Receptionist', icon: 'desk', email: 'receptionist@hospital.com', theme: 'purple', btnBg: 'bg-purple-600 hover:bg-purple-700 text-white', badgeBg: 'bg-purple-100 text-purple-900 border-purple-300' },
    { id: 'DOCTOR', label: 'Doctor', icon: 'stethoscope', email: 'doctor@hospital.com', theme: 'green', btnBg: 'bg-green-600 hover:bg-green-700 text-white', badgeBg: 'bg-green-100 text-green-900 border-green-300' },
    { id: 'NURSE', label: 'Nurse', icon: 'monitor_heart', email: 'nurse@hospital.com', theme: 'teal', btnBg: 'bg-teal-600 hover:bg-teal-700 text-white', badgeBg: 'bg-teal-100 text-teal-900 border-teal-300' },
    { id: 'LAB_TECHNICIAN', label: 'Lab Tech', icon: 'biotech', email: 'labtech@hospital.com', theme: 'orange', btnBg: 'bg-orange-600 hover:bg-orange-700 text-white', badgeBg: 'bg-orange-100 text-orange-900 border-orange-300' },
    { id: 'PHARMACY', label: 'Pharmacy', icon: 'medication', email: 'pharmacy@hospital.com', theme: 'emerald', btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'ACCOUNTS', label: 'Accounts', icon: 'account_balance_wallet', email: 'accounts@hospital.com', theme: 'indigo', btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white', badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { id: 'PATIENT', label: 'Patient', icon: 'patient_list', email: 'patient@hospital.com', theme: 'cyan', btnBg: 'bg-cyan-600 hover:bg-cyan-700 text-white', badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
];

const Login = () => {
    const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
    const [formData, setFormData] = useState({ email: 'superadmin@hospital.com', password: 'password123' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const currentRoleConfig = ROLES_LIST.find(r => r.id === selectedRole) || ROLES_LIST[0];

    const handleSelectRole = (roleItem) => {
        setSelectedRole(roleItem.id);
        setFormData({
            email: roleItem.email,
            password: 'password123'
        });
        toast.success(`Theme Accent Switched: ${roleItem.label} (${roleItem.theme.toUpperCase()})`, { duration: 1500 });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            const { token, refreshToken, data } = response.data;
            
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            
            login(token, data);
            toast.success(`Welcome back, ${data.name}!`);
            
            if (data.role === 'SUPER_ADMIN') navigate('/superadmin/dashboard');
            else if (data.role === 'RECEPTIONIST') navigate('/receptionist/dashboard');
            else if (data.role === 'DOCTOR') navigate('/doctor/dashboard');
            else if (data.role === 'NURSE') navigate('/nurse/dashboard');
            else if (data.role === 'LAB_TECHNICIAN') navigate('/lab/dashboard');
            else if (data.role === 'PHARMACY') navigate('/pharmacy/dashboard');
            else if (data.role === 'ACCOUNTS') navigate('/accounts/dashboard');
            else navigate('/user/dashboard');

        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex w-full min-h-screen">
            {/* Left Side: High-end Medical Branding */}
            <section className="hidden lg:flex w-5/12 relative bg-primary-container overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/50"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-tertiary-fixed/20 blur-3xl animate-pulse"></div>
                </div>
                <div className="relative z-10 text-on-primary space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        Production Authentication System
                    </div>
                    <h1 className="font-display text-4xl font-semibold leading-tight">Role-Based Hospital ERP Gateway</h1>
                    <p className="font-body-lg text-sm opacity-90 leading-relaxed">
                        Select your hospital role to view its dedicated theme accent color, autofill demo credentials, and access role-restricted pages.
                    </p>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-xs space-y-1.5 text-white/90">
                        <div className="font-bold text-white mb-1">🔐 Security & Role Accent Guide:</div>
                        <div>• Super Admin: <span className="font-bold text-blue-200">Blue</span></div>
                        <div>• Receptionist: <span className="font-bold text-purple-200">Purple</span></div>
                        <div>• Doctor: <span className="font-bold text-green-200">Green</span></div>
                        <div>• Nurse: <span className="font-bold text-teal-200">Teal</span></div>
                        <div>• Lab Tech: <span className="font-bold text-orange-200">Orange</span></div>
                        <div>• Pharmacy: <span className="font-bold text-emerald-200">Emerald</span></div>
                        <div>• Accounts: <span className="font-bold text-indigo-200">Indigo</span></div>
                        <div>• Patient: <span className="font-bold text-cyan-200">Cyan</span></div>
                    </div>
                </div>
            </section>

            {/* Right Side: Interactive Login Form with Role Accent Theme System */}
            <section className="w-full lg:w-7/12 bg-surface flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-xl mx-auto space-y-6">
                    {/* Header Branding */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                            <span className="font-headline-md text-2xl font-bold text-primary tracking-tight">Lumina ERP</span>
                        </div>
                        <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${currentRoleConfig.badgeBg}`}>
                            {currentRoleConfig.label} Theme
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Portal Sign In</h2>
                        <p className="text-on-surface-variant font-body-md text-sm">Select role accent color or type credentials.</p>
                    </div>

                    {/* Role Selector Grid */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Select Hospital Role (Applies Role Accent Theme):</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ROLES_LIST.map((r) => {
                                const isSelected = selectedRole === r.id;
                                return (
                                    <button
                                        type="button"
                                        key={r.id}
                                        onClick={() => handleSelectRole(r)}
                                        className={`p-3 rounded-xl border text-left flex flex-col items-center text-center gap-1.5 transition-all duration-200 ${
                                            isSelected 
                                            ? `${r.btnBg} shadow-md scale-105 font-bold` 
                                            : 'bg-white hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">{r.icon}</span>
                                        <span className="text-xs leading-tight">{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5 pt-2">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-on-surface" htmlFor="email">
                                Email Address / User ID
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                                <input 
                                    className="w-full bg-white border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-4 text-on-surface font-body-md outline-none transition-all" 
                                    id="email" 
                                    name="email" 
                                    placeholder="name@hospital.com" 
                                    required 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-bold text-on-surface" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="font-label-sm text-xs font-semibold text-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                                <input 
                                    className="w-full bg-white border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3 pl-10 pr-10 text-on-surface font-body-md outline-none transition-all" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <button 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button with Role Accent Color */}
                        <div className="pt-2">
                            <button 
                                className={`w-full py-3.5 rounded-xl font-label-md text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-70 ${currentRoleConfig.btnBg}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In as {currentRoleConfig.label}
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <footer className="pt-4 text-center space-y-2">
                        <p className="font-body-sm text-xs text-on-surface-variant">
                            New Patient? <Link to="/register" className="font-bold text-primary hover:underline">Self-Register here</Link> | Staff onboarded by Super Admin.
                        </p>
                    </footer>
                </div>

                <div className="pt-6 text-center w-full border-t border-outline-variant/20 mt-6">
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-tight">
                        © 2026 Lumina Health ERP System. Enterprise Clinical Governance.
                    </p>
                </div>
            </section>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
            )}
        </main>
    );
};

export default Login;