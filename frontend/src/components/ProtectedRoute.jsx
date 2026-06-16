import React, { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Button from './ui/Button';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 border-4 border-red-100">
                            <ShieldAlert className="w-10 h-10" />
                        </div>
                    </div>
                    
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-2">403</h1>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 tracking-tight">Access Denied</h2>
                    
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        You do not have permission to view this page. Please verify your account privileges or contact administration.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                            Go Back
                        </Button>
                        <Button variant="primary" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                            Sign In
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;