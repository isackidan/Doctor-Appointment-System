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
            toast.success('OPD Time Slot published successfully!');
            setFormData({ slot_date: '', start_time: '', end_time: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add slot.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Banner with Teal Doctor Theme */}
            <div className="bg-teal-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex items-center justify-between">
                <div className="absolute right-[-10%] top-[-20%] w-72 h-72 bg-teal-600/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-teal-200 mb-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        OPD Schedule Management
                    </div>
                    <h1 className="font-display text-3xl font-bold">Manage Doctor Time Slots</h1>
                    <p className="text-teal-200 text-xs">Set available hours for OPD patient consultation slots.</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-800 border border-teal-700 text-teal-200 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🕒
                </div>
            </div>

            {/* Create Slot Form Card */}
            <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/30">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">more_time</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-on-surface">Publish New OPD Slot</h3>
                        <p className="text-xs text-teal-700 font-bold mt-0.5">Define consultation hours for patient booking</p>
                    </div>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-on-surface mb-2">Select OPD Date *</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_month</span>
                            <input
                                type="date"
                                name="slot_date"
                                required
                                min={todayDate}
                                value={formData.slot_date}
                                onChange={handleChange}
                                className="w-full bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-on-surface font-mono font-bold transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-on-surface mb-2">Start Time *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">schedule</span>
                                <input
                                    type="time"
                                    name="start_time"
                                    required
                                    min={formData.slot_date === todayDate ? new Date().toTimeString().slice(0, 5) : undefined}
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-on-surface font-mono font-bold transition-all outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold uppercase text-on-surface mb-2">End Time *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">update</span>
                                <input
                                    type="time"
                                    name="end_time"
                                    required
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-on-surface font-mono font-bold transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/30">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isLoading 
                                ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none' 
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-900/20 active:scale-95'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Publishing Time Slot...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Publish Time Slot for Patients
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