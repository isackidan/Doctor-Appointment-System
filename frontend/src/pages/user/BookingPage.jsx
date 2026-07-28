import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading available slots...</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md mb-6"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Doctors
                </button>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Select Appointment Time</h2>
                <p className="text-on-surface-variant text-base mt-2">Choose an available slot for your consultation.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm">
                {slots.length === 0 ? (
                    <div className="text-center bg-surface-container-low rounded-2xl text-on-surface-variant py-16 border border-outline-variant/30 font-label-md flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-[48px] text-outline opacity-50">event_busy</span>
                        No available slots for this doctor right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {slots.map((slot) => {
                            const slotDate = new Date(slot.slot_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                            const startTime = slot.start_time.slice(0, 5);
                            const endTime = slot.end_time.slice(0, 5);

                            return (
                                <button 
                                    key={slot.slot_id}
                                    onClick={() => setSelectedSlot(slot.slot_id)}
                                    className={`p-4 border rounded-xl text-center transition-all duration-200 focus:outline-none flex flex-col items-center gap-1 ${
                                        selectedSlot === slot.slot_id 
                                        ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-105' 
                                        : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-high'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px] opacity-70 mb-1">calendar_today</span>
                                    <div className="text-[11px] font-label-sm uppercase tracking-wider opacity-80">{slotDate}</div>
                                    <div className="font-headline-sm font-bold mt-1 text-sm">{startTime} - {endTime}</div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-end gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl font-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleBookAppointment}
                        disabled={!selectedSlot}
                        className={`px-6 py-2.5 rounded-xl font-label-md font-bold shadow-md transition-all flex items-center gap-2 ${
                            selectedSlot 
                            ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg active:scale-95' 
                            : 'bg-surface-container-high text-outline cursor-not-allowed shadow-none border border-outline-variant/30'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;