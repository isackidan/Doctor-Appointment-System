import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const BookingPage = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const response = await api.get(`/doctor/${doctorId}/slots`);
                setSlots(response.data.data);
            } catch (err) {
                console.error("Error fetching slots", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [doctorId]);

    const handleBookAppointment = async () => {
        if (!selectedSlot) return;
        
        try {
            const toastId = toast.loading('Booking in progress...');
            const response = await api.post('/appointments/book', { slot_id: selectedSlot });
            toast.success(`Success! Total Fee: ₹${response.data.data.total_fee}`, { id: toastId });
            
            setSlots(slots.filter(slot => slot.slot_id !== selectedSlot));
            setSelectedSlot(null);
            
            setTimeout(() => navigate('/user/dashboard'), 2000);
            
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book slot. It might be already taken.');
        }
    };

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading available slots...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Select Appointment Time</h2>
                <p className="text-sm text-gray-500 mt-1">Choose an available slot for your consultation.</p>
            </div>

            <Card className="p-8">
                {slots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-medium">
                        No available slots for this doctor right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {slots.map((slot) => {
                            const slotDate = new Date(slot.slot_date).toLocaleDateString();
                            const startTime = slot.start_time.slice(0, 5);
                            const endTime = slot.end_time.slice(0, 5);

                            return (
                                <button 
                                    key={slot.slot_id}
                                    onClick={() => setSelectedSlot(slot.slot_id)}
                                    className={`p-4 border rounded-xl text-center transition-all duration-200 focus:outline-none ${
                                        selectedSlot === slot.slot_id 
                                        ? 'bg-primary text-white border-primary shadow-md scale-105' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{slotDate}</div>
                                    <div className="font-bold text-sm">{startTime} - {endTime}</div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <Button 
                        variant="outline"
                        onClick={() => navigate('/user/dashboard')}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={handleBookAppointment}
                        disabled={!selectedSlot}
                        className={!selectedSlot ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Confirm Booking
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default BookingPage;