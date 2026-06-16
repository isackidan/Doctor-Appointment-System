import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DoctorCard from '../../components/DoctorCard';
import Card from '../../components/ui/Card';

const UserDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctor/list');
                setDoctors(response.data.data);
            } catch (err) {
                console.error("Error fetching doctors:", err);
                setError('Failed to load doctors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading available doctors...</div>;
    
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Find a Doctor</h2>
                <p className="text-gray-500 text-sm mt-1">Book an appointment with our highly qualified professionals.</p>
            </div>

            {doctors.length === 0 ? (
                <Card>
                    <div className="text-center text-gray-500 py-8">
                        No doctors are currently available or approved.
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.doctor_profile_id} doctor={doctor} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;