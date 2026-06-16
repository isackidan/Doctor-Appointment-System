import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'USER',
        specialization: '', consultation_fee: '', hospital_address: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-20"></div>
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold mb-4">Join DocConnect</h1>
                    <p className="text-lg text-gray-300 mb-8">
                        Experience the premium way to manage your healthcare. Sign up as a patient or register your practice.
                    </p>
                    <div className="flex gap-4">
                        <div className="h-2 w-2 bg-white/30 rounded-full"></div>
                        <div className="h-2 w-16 bg-primary rounded-full"></div>
                        <div className="h-2 w-2 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-500 mt-2">Sign up to get started.</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input 
                            label="Full Name" 
                            name="name" 
                            type="text" 
                            required 
                            placeholder="John Doe"
                            onChange={handleChange} 
                        />
                        <Input 
                            label="Email Address" 
                            name="email" 
                            type="email" 
                            required 
                            placeholder="john@example.com"
                            onChange={handleChange} 
                        />
                        <Input 
                            label="Password" 
                            name="password" 
                            type="password" 
                            required 
                            minLength="6" 
                            placeholder="Create a strong password"
                            onChange={handleChange} 
                        />
                        
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm font-medium text-gray-700">Account Type</label>
                            <select 
                                name="role" 
                                onChange={handleChange} 
                                value={formData.role}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                            >
                                <option value="USER">Patient (User)</option>
                                <option value="DOCTOR">Doctor</option>
                            </select>
                        </div>

                        {/* Show extra fields only if DOCTOR is selected */}
                        {formData.role === 'DOCTOR' && (
                            <div className="p-5 mt-2 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Doctor Details</h4>
                                <Input 
                                    label="Specialization" 
                                    name="specialization" 
                                    type="text" 
                                    required={formData.role === 'DOCTOR'} 
                                    placeholder="e.g. Cardiologist"
                                    onChange={handleChange} 
                                />
                                <Input 
                                    label="Consultation Fee (₹)" 
                                    name="consultation_fee" 
                                    type="number" 
                                    required={formData.role === 'DOCTOR'} 
                                    placeholder="500"
                                    onChange={handleChange} 
                                />
                                <Input 
                                    label="Hospital/Clinic Address" 
                                    name="hospital_address" 
                                    type="text" 
                                    required={formData.role === 'DOCTOR'} 
                                    placeholder="123 Health Ave, Medical City"
                                    onChange={handleChange} 
                                />
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full mt-6 py-2.5"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Register'}
                        </Button>
                    </form>
                    
                    <p className="mt-8 text-sm text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;