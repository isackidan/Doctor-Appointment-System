import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, UserPlus, Calendar, DollarSign } from 'lucide-react';

const StatBox = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center font-semibold text-gray-700">Loading Dashboard Analytics...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome, Admin.</h2>
                <p className="text-gray-500 text-sm">Here is your business statistics.</p>
            </div>

            <Card title="Business Analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <StatBox 
                        title="Total Patients" 
                        value={stats.total_patients} 
                        icon={Users} 
                    />
                    <StatBox 
                        title="Registered Doctors" 
                        value={stats.total_doctors} 
                        icon={UserPlus} 
                    />
                    <StatBox 
                        title="Total Appointments" 
                        value={stats.total_appointments} 
                        icon={Calendar} 
                    />
                    <StatBox 
                        title="Total Earnings" 
                        value={`₹${stats.total_earnings}`} 
                        icon={DollarSign} 
                        subtitle="From completed appointments"
                    />
                </div>
            </Card>

            <Card title="Quick Actions">
                <div className="flex gap-4 mt-2">
                    <Button variant="primary" onClick={() => navigate('/admin/doctors')}>
                        Review Pending Doctors
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin/appointments')}>
                        View All Appointments
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;