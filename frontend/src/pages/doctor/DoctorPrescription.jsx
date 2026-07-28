import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorPrescription = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ medication_details: '', notes: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post(`/doctor/appointment/${appointmentId}/prescription`, formData);
            toast.success('Prescription added successfully! Redirecting...');
            setTimeout(() => navigate('/doctor/dashboard'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add prescription.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md mb-6"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Dashboard
                </button>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">Write Prescription</h2>
                <p className="font-body-lg text-on-surface-variant">Provide medication details and notes to complete the appointment.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">prescriptions</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-headline-sm font-bold text-on-surface">Rx Form</h3>
                            <p className="text-sm font-label-md text-primary mt-1">Appointment #{appointmentId}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-label-md font-bold text-on-surface mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-primary">medication</span>
                            Medication Details <span className="text-error">*</span>
                        </label>
                        <div className="relative group">
                            <textarea 
                                required
                                rows="5"
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface font-body-lg transition-all outline-none resize-y"
                                placeholder="e.g., Paracetamol 500mg - 2 times a day for 3 days"
                                value={formData.medication_details}
                                onChange={(e) => setFormData({...formData, medication_details: e.target.value})}
                            />
                            <div className="absolute right-3 bottom-3 text-xs text-outline opacity-50 group-focus-within:opacity-100 transition-opacity font-label-sm uppercase tracking-wider">Required</div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block font-label-md font-bold text-on-surface mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-tertiary">note_alt</span>
                            Additional Notes
                        </label>
                        <textarea 
                            rows="4"
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-tertiary focus:ring-2 focus:ring-tertiary/20 rounded-xl p-4 text-on-surface font-body-lg transition-all outline-none resize-y"
                            placeholder="e.g., Drink plenty of warm water, avoid cold beverages..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-outline-variant/30 mt-8">
                        <button 
                            type="button" 
                            onClick={() => navigate('/doctor/dashboard')} 
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl font-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading || !formData.medication_details.trim()}
                            className={`px-8 py-2.5 rounded-xl font-label-md font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                                isLoading || !formData.medication_details.trim()
                                ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none'
                                : 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    Submit & Complete
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorPrescription;