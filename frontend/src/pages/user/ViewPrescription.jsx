import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ViewPrescription = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                const response = await api.get(`/appointments/${appointmentId}/prescription`);
                setPrescription(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load prescription');
            } finally {
                setLoading(false);
            }
        };
        fetchPrescription();
    }, [appointmentId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading prescription...</p>
        </div>
    );
    
    if (error) return (
        <div className="max-w-2xl mx-auto mt-6 animate-in fade-in duration-500">
            <div className="bg-error-container text-on-error-container p-8 rounded-2xl text-center shadow-sm border border-error/20">
                <span className="material-symbols-outlined text-[48px] opacity-80 mb-4">error</span>
                <div className="font-label-md font-semibold mb-6">{error}</div>
                <button 
                    onClick={() => navigate(-1)}
                    className="bg-error text-on-error px-6 py-2.5 rounded-xl font-label-md font-bold hover:bg-error/90 transition-colors shadow-sm"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md mb-6"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Appointments
                </button>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Medical Prescription</h2>
                <p className="text-on-surface-variant text-base mt-2">Review the details and notes from your consultation.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden relative">
                {/* Top Banner Accent */}
                <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full"></div>
                
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-outline-variant/30">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">prescriptions</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-headline-sm font-bold text-on-surface">Prescription Details</h3>
                                <p className="text-sm font-label-md text-primary mt-1">Rx Document</p>
                            </div>
                        </div>
                        <span className="text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/20 shadow-sm">
                            {new Date(prescription.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-label-md font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">medication</span> 
                            Medication Details
                        </h4>
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 whitespace-pre-wrap text-on-surface font-body-lg leading-relaxed shadow-sm">
                            {prescription.medication_details}
                        </div>
                    </div>

                    {prescription.notes && (
                        <div className="mb-8">
                            <h4 className="text-sm font-label-md font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-tertiary text-[20px]">note_alt</span> 
                                Doctor's Notes
                            </h4>
                            <div className="bg-tertiary-container/30 p-6 rounded-2xl border border-tertiary/20 whitespace-pre-wrap text-on-surface font-body-lg leading-relaxed shadow-sm">
                                {prescription.notes}
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-outline-variant/30 flex justify-end">
                        <button 
                            onClick={() => window.print()} 
                            className="bg-surface-container-high text-on-surface border border-outline-variant/30 px-6 py-2.5 rounded-xl font-label-md font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Print or Save PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPrescription;