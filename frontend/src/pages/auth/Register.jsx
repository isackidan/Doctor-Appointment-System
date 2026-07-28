import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'USER',
        specialization: '', consultation_fee: '', hospital_address: '', certificate: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, certificate: e.target.files[0] });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                submitData.append(key, formData[key]);
            }
        });

        try {
            await api.post('/auth/register', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
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
                            <span className="material-symbols-outlined text-[18px]">medical_services</span>
                            Join the Future of Healthcare
                        </span>
                        <h1 className="font-display text-5xl font-semibold mb-4">Register your account.</h1>
                        <p className="font-body-lg text-lg opacity-90 leading-relaxed">
                            Experience the premium way to manage your healthcare. Sign up as a patient to book top doctors, or register your practice to reach more patients.
                        </p>
                    </div>
                    {/* Abstract high-end image */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnntlt6isLe6s55IMkx6bcxbrAh1as26C8mHYygEKCalEzs3v8HPTzAgRhGP1UAUwsYG1Ox-pND5DqO7rqMfQaoHCrVPoojjHCs9Bvu3zLfmDpqDLP-JrVhseQ4p86YlSpncV009VhfpcuTmhoIZPx4QRMq5ButPYyzkAj18HnfxxsKA0rTzL56mYB3niNfr-1oq7VikeSuyld1lrrR_Zqcbsg8Nw9kU_0VsEaOk92bNLXJeFqIkTSUdQa_Khrns-dMcoYCQ1UP2I')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* Right Side: Register Form */}
            <section className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen">
                {/* Branding */}
                <div className="absolute top-6 left-6 lg:left-12 flex items-center gap-2 bg-surface z-10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                    <span className="font-headline-md text-2xl font-bold text-primary tracking-tight">Lumina Health</span>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 mt-20 lg:mt-0 py-10">
                    <div className="mb-8">
                        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Create Account</h2>
                        <p className="text-on-surface-variant font-body-md text-base">Sign up to get started with Lumina.</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Role Selection */}
                        <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'USER'})}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.role === 'USER' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'DOCTOR'})}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.role === 'DOCTOR' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Doctor
                            </button>
                        </div>

                        {/* Full Name */}
                        <div className="group">
                            <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">person</span>
                                <input 
                                    className="input-linear w-full py-3 pl-8 text-on-surface placeholder:text-outline-variant font-body-md" 
                                    name="name" 
                                    placeholder="John Doe" 
                                    required 
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="group">
                            <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                                <input 
                                    className="input-linear w-full py-3 pl-8 text-on-surface placeholder:text-outline-variant font-body-md" 
                                    name="email" 
                                    placeholder="name@example.com" 
                                    required 
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                                <input 
                                    className="input-linear w-full py-3 pl-8 pr-10 text-on-surface placeholder:text-outline-variant font-body-md" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength="6"
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

                        {/* Doctor Specific Fields */}
                        {formData.role === 'DOCTOR' && (
                            <div className="p-5 mt-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-5">
                                <h4 className="text-sm font-bold text-on-surface mb-2">Professional Details</h4>
                                
                                <div className="group">
                                    <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1">Specialization</label>
                                    <input 
                                        className="input-linear w-full py-2 text-on-surface placeholder:text-outline-variant font-body-md" 
                                        name="specialization" 
                                        placeholder="e.g. Cardiologist" 
                                        required={formData.role === 'DOCTOR'} 
                                        type="text"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1">Consultation Fee (₹)</label>
                                    <input 
                                        className="input-linear w-full py-2 text-on-surface placeholder:text-outline-variant font-body-md" 
                                        name="consultation_fee" 
                                        placeholder="500" 
                                        required={formData.role === 'DOCTOR'} 
                                        type="number"
                                        value={formData.consultation_fee}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block font-label-md text-sm font-medium text-on-surface-variant mb-1">Hospital/Clinic Address</label>
                                    <input 
                                        className="input-linear w-full py-2 text-on-surface placeholder:text-outline-variant font-body-md" 
                                        name="hospital_address" 
                                        placeholder="123 Health Ave, Medical City" 
                                        required={formData.role === 'DOCTOR'} 
                                        type="text"
                                        value={formData.hospital_address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-2 font-label-md text-sm font-medium text-on-surface-variant">Medical Certificate</label>
                                    <input 
                                        type="file" 
                                        name="certificate"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required={formData.role === 'DOCTOR'}
                                        onChange={handleFileChange}
                                        className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high transition-colors cursor-pointer"
                                    />
                                    <p className="mt-1 text-[11px] text-outline">PDF, JPG, or PNG (Max 5MB)</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4">
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <footer className="mt-8 text-center">
                        <p className="font-body-sm text-sm text-on-surface-variant">
                            Already have an account? <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4">Sign In here</Link>
                        </p>
                    </footer>
                </div>
            </section>
        </main>
    );
};

export default Register;