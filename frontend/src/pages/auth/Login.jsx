import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
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
        <div className="flex min-h-screen bg-gray-50">
            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold mb-4">DocConnect</h1>
                    <p className="text-lg text-white/90 mb-8">
                        Your premium healthcare scheduling platform. Connect with top doctors or manage your practice with ease.
                    </p>
                    <div className="flex gap-4">
                        <div className="h-2 w-16 bg-white/30 rounded-full"></div>
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                        <div className="h-2 w-2 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            label="Email Address" 
                            name="email"
                            type="email" 
                            required 
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        />
                        <Input 
                            label="Password" 
                            name="password"
                            type="password" 
                            required 
                            placeholder="Enter your password"
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                        
                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full mt-4 py-2.5"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    
                    <p className="mt-8 text-sm text-center text-gray-600">
                        Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;