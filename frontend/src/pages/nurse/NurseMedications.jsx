import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseMedications = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nurse/prescriptions');
            setPrescriptions(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load medication schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleLogMedication = async (itemId, status) => {
        try {
            await api.post(`/nurse/medications/${itemId}/log`, { status, remarks: `Administered by Nurse @ ${new Date().toLocaleTimeString()}` });
            toast.success(`Medication marked as ${status}!`);
            fetchPrescriptions();
        } catch (err) {
            toast.error('Failed to log medication');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Medication Administration Log</h2>
                <p className="font-body-lg text-on-surface-variant mt-1">Track doctor-prescribed medications, dosage, frequency, and log administration timestamps.</p>
            </div>

            <div className="space-y-4">
                {prescriptions.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border text-center text-on-surface-variant font-bold">
                        No active medication administration schedules found.
                    </div>
                ) : prescriptions.map(rx => (
                    <div key={rx.id} className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 font-mono text-xs">
                            <div>
                                <span className="font-bold text-sm text-on-surface font-sans">👤 Patient: {rx.patient?.user?.name}</span>
                                <div className="text-rose-700 font-extrabold">{rx.patient?.patientCode} • Prescribed by Dr. {rx.doctor?.user?.name}</div>
                            </div>
                            <span className="bg-rose-50 text-rose-800 px-3 py-1 rounded-full border font-bold">
                                Date: {new Date(rx.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {rx.items?.map(item => (
                                <div key={item.id} className="p-4 bg-surface-container-low rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                    <div className="space-y-1">
                                        <div className="font-bold text-sm text-rose-950">💊 {item.medicineName}</div>
                                        <div className="font-mono text-on-surface-variant">
                                            Dosage: <strong>{item.dosage}</strong> • Frequency: <strong className="text-rose-700">{item.frequency}</strong> • Duration: <strong>{item.durationDays} days</strong>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.medicationLogs?.[0] && (
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                                                item.medicationLogs[0].status === 'GIVEN'
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                            }`}>
                                                {item.medicationLogs[0].status === 'GIVEN' ? '✓ Given' : '⏸ Held'} @ {new Date(item.medicationLogs[0].administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleLogMedication(item.id, 'GIVEN')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-xs flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            Mark Given
                                        </button>
                                        <button
                                            onClick={() => handleLogMedication(item.id, 'HOLD')}
                                            className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-bold hover:bg-amber-200"
                                        >
                                            Hold
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseMedications;
