import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const todayDate = new Date().toISOString().split('T')[0];

const DoctorSlots = () => {
    const [formData, setFormData] = useState({
        slot_date: '',
        start_time: '',
        end_time: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.slot_date === todayDate) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (formData.start_time <= currentTime) {
                toast.error('Cannot create slots in the past time for today.');
                setIsLoading(false);
                return;
            }
        }

        try {
            const payload = {
                slot_date: formData.slot_date,
                start_time: `${formData.start_time}:00`,
                end_time: `${formData.end_time}:00`
            };

            await api.post('/doctor/slots', payload);
            toast.success('Slot added successfully!');
            setFormData({ slot_date: '', start_time: '', end_time: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add slot.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">Manage Availability</h2>
                <p className="font-body-lg text-on-surface-variant">Add new time slots for patient appointments.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/30">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">more_time</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-headline-sm font-bold text-on-surface">Create New Slot</h3>
                        <p className="text-sm font-label-md text-primary mt-1">Set your available hours</p>
                    </div>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-6">
                    <div>
                        <label className="block font-label-md font-bold text-on-surface mb-2">Select Date</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_month</span>
                            <input
                                type="date"
                                name="slot_date"
                                required
                                min={todayDate}
                                value={formData.slot_date}
                                onChange={handleChange}
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3 pl-12 pr-4 text-on-surface font-body-lg transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-label-md font-bold text-on-surface mb-2">Start Time</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">schedule</span>
                                <input
                                    type="time"
                                    name="start_time"
                                    required
                                    min={formData.slot_date === todayDate ? new Date().toTimeString().slice(0, 5) : undefined}
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3 pl-12 pr-4 text-on-surface font-body-lg transition-all outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-label-md font-bold text-on-surface mb-2">End Time</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">update</span>
                                <input
                                    type="time"
                                    name="end_time"
                                    required
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3 pl-12 pr-4 text-on-surface font-body-lg transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-outline-variant/30">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl font-label-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                                isLoading 
                                ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none' 
                                : 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Adding Slot...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Publish Slot
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorSlots;