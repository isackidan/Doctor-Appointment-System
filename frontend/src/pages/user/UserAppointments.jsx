import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { FileText, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        try {
            await api.put(`/appointments/${appointmentId}/cancel`);
            toast.success("Appointment cancelled successfully");
            fetchAppointments(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel appointment.");
        }
    };

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading your history...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">My Appointment History</h2>
                <p className="text-sm text-gray-500 mt-1">Track your past and upcoming consultations.</p>
            </div>

            {appointments.length === 0 ? (
                <Card>
                    <div className="text-center py-8 text-gray-500 font-medium">
                        You haven't booked any appointments yet. Head to the dashboard to find a doctor!
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.map((appt) => {
                        const date = new Date(appt.slot_date).toLocaleDateString();
                        const time = `${appt.start_time.slice(0, 5)} - ${appt.end_time.slice(0, 5)}`;
                        
                        let statusVariant = 'default';
                        if (appt.status === 'BOOKED') statusVariant = 'primary';
                        else if (appt.status === 'COMPLETED') statusVariant = 'success';
                        else if (appt.status === 'CANCELLED') statusVariant = 'danger';

                        return (
                            <Card key={appt.appointment_id} className="relative overflow-hidden p-0 flex flex-col h-full">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'BOOKED' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                
                                <div className="p-6 pl-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{appt.doctor_name}</h3>
                                            <p className="text-sm text-gray-500">{appt.specialization}</p>
                                        </div>
                                        <Badge status={statusVariant}>{appt.status}</Badge>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-sm space-y-3 mb-4 flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-medium">Date:</span>
                                            <span className="font-semibold text-gray-800">{date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-medium">Time:</span>
                                            <span className="font-semibold text-gray-800">{time}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                                            <span className="text-gray-500 font-medium">Total Paid:</span>
                                            <span className="font-bold text-gray-800">₹{appt.total_fee}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2">
                                        {appt.status === 'COMPLETED' && (
                                            <Button 
                                                variant="outline"
                                                className="w-full flex justify-center items-center gap-2 text-sm"
                                                onClick={() => navigate(`/user/prescription/${appt.appointment_id}`)}
                                            >
                                                <FileText className="w-4 h-4" /> View Prescription
                                            </Button>
                                        )}

                                        {appt.status === 'BOOKED' && (
                                            <Button 
                                                variant="outline"
                                                className="w-full flex justify-center items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                                onClick={() => handleCancel(appt.appointment_id)}
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel Appointment
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

export default UserAppointments;