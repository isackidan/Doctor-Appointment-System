import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            const { token, data } = response.data;
            
            login(token, data);
            toast.success('Welcome back!');
            
            if (data.role === 'ADMIN') navigate('/admin/dashboard');
            else if (data.role === 'DOCTOR') navigate('/doctor/dashboard');
            else navigate('/user/dashboard');

        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex w-full min-h-screen">
            {/* Left Side: High-end Medical Illustration / Abstract */}
            <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/40"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-fixed/20 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary-fixed/30 blur-3xl"></div>
                </div>
                {/* Content Layer */}
                <div className="relative z-10 p-12 max-w-xl text-on-primary">
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm font-label-md text-label-md text-white mb-6">
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            Clinical-Grade Security
                        </span>
                        <h1 className="font-display text-5xl font-semibold mb-4">Welcome to Lumina Health.</h1>
                        <p className="font-body-lg text-lg opacity-90 leading-relaxed">
                            Precision medicine meets human-centric design. Access your clinical dashboard, patient data, and diagnostic tools with a seamless, secure login.
                        </p>
                    </div>
                    {/* Abstract high-end image */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnntlt6isLe6s55IMkx6bcxbrAh1as26C8mHYygEKCalEzs3v8HPTzAgRhGP1UAUwsYG1Ox-pND5DqO7rqMfQaoHCrVPoojjHCs9Bvu3zLfmDpqDLP-JrVhseQ4p86YlSpncV009VhfpcuTmhoIZPx4QRMq5ButPYyzkAj18HnfxxsKA0rTzL56mYB3niNfr-1oq7VikeSuyld1lrrR_Zqcbsg8Nw9kU_0VsEaOk92bNLXJeFqIkTSUdQa_Khrns-dMcoYCQ1UP2I')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* Right Side: Login Form */}
            <section className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-6 sm:p-12 relative">
                {/* Branding */}
                <div className="absolute top-6 left-6 lg:left-12 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                    <span className="font-headline-md text-2xl font-bold text-primary tracking-tight">Lumina Health</span>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-12 mt-10 lg:mt-0">
                        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Sign In</h2>
                        <p className="text-on-surface-variant font-body-md text-base">Enter your credentials to continue.</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-8">
                        {/* Email Field */}
                        <div className="group">
                            <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                                <input 
                                    className="input-linear w-full py-3 pl-8 text-on-surface placeholder:text-outline-variant font-body-md" 
                                    id="email" 
                                    name="email" 
                                    placeholder="name@example.com" 
                                    required 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block font-label-md text-sm font-medium text-on-surface-variant transition-colors group-focus-within:text-primary" htmlFor="password">
                                    Password
                                </label>
                                <a className="font-label-sm text-xs font-semibold text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                                <input 
                                    className="input-linear w-full py-3 pl-8 pr-10 text-on-surface placeholder:text-outline-variant font-body-md" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <button 
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors p-2" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-6">
                            <button 
                                className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-md text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary-container hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            
                            <div className="relative flex items-center gap-4 py-4">
                                <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
                                <span className="font-label-sm text-xs text-on-surface-variant/60 uppercase tracking-widest">or continue with</span>
                                <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 h-11 border border-outline-variant/50 rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-sm text-on-surface" type="button">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                    </svg>
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 h-11 border border-outline-variant/50 rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-sm text-on-surface" type="button">
                                    <span className="material-symbols-outlined text-[20px] text-on-surface">fingerprint</span>
                                    Passkey
                                </button>
                            </div>
                        </div>
                    </form>

                    <footer className="mt-16 text-center">
                        <p className="font-body-sm text-sm text-on-surface-variant">
                            New to Lumina? <Link to="/register" className="font-bold text-primary hover:underline underline-offset-4">Register now</Link>
                        </p>
                        <div className="mt-8 flex justify-center gap-6 opacity-60">
                            <a className="font-label-sm text-xs hover:text-on-surface transition-colors" href="#">Privacy</a>
                            <a className="font-label-sm text-xs hover:text-on-surface transition-colors" href="#">Security</a>
                            <a className="font-label-sm text-xs hover:text-on-surface transition-colors" href="#">HIPAA</a>
                        </div>
                    </footer>
                </div>

                {/* Footer Copy */}
                <div className="absolute bottom-6 text-center w-full px-6 left-0">
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-tighter">
                        © 2026 Lumina Health. Clinical Excellence meets Human-Centric Design.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;