import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseInstructions = () => {
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nurse/doctor-instructions');
            setInstructions(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load doctor instructions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Doctor Instructions & Triage Directives</h2>
                <p className="font-body-lg text-on-surface-variant mt-1">Review clinical instructions issued by attending physicians.</p>
            </div>

            <div className="space-y-4">
                {instructions.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border text-center text-on-surface-variant font-bold">
                        No active doctor instructions found.
                    </div>
                ) : instructions.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b pb-2 text-xs font-mono">
                            <span className="font-bold text-rose-950 text-sm font-sans">👤 Patient: {item.patientName}</span>
                            <span className="bg-rose-50 text-rose-800 px-3 py-1 rounded-full border font-bold">Dr. {item.doctorName}</span>
                        </div>
                        <div className="text-sm font-semibold text-on-surface">
                            📋 <strong>Instruction:</strong> {item.instructions}
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 text-xs font-mono">
                            <span>Status: <strong className="text-emerald-700">{item.status}</strong></span>
                            <span className="text-on-surface-variant">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseInstructions;
