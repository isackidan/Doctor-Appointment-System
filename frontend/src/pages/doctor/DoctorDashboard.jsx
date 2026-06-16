import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/doctor/appointments');
                setAppointments(response.data.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading your schedule...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">My Upcoming Appointments</h2>
                <p className="text-gray-500 text-sm mt-1">View and manage your scheduled patient visits.</p>
            </div>

            {appointments.length === 0 ? (
                <Card>
                    <div className="text-center py-8 text-gray-500 font-medium">
                        You don't have any booked appointments yet.
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.map((appt) => {
                        const date = new Date(appt.slot_date).toLocaleDateString();
                        const time = `${appt.start_time.slice(0, 5)} - ${appt.end_time.slice(0, 5)}`;

                        return (
                            <Card key={appt.appointment_id} className="relative overflow-hidden p-0">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'BOOKED' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                <div className="p-6 pl-8">
                                    <h3 className="text-lg font-bold text-gray-800">{appt.patient_name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{appt.patient_email}</p>

                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date</div>
                                            <div className="text-sm font-semibold text-gray-800">{date}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Time</div>
                                            <div className="text-sm font-semibold text-primary">{time}</div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex justify-between items-center">
                                        <Badge status={appt.status === 'BOOKED' ? 'primary' : 'default'}>
                                            {appt.status}
                                        </Badge>
                                        
                                        {appt.status === 'BOOKED' && (
                                            <Button 
                                                variant="primary" 
                                                className="text-sm px-3 py-1.5"
                                                onClick={() => navigate(`/doctor/prescription/${appt.appointment_id}`)}
                                            >
                                                Add Prescription
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;