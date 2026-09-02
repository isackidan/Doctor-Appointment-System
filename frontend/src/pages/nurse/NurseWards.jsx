import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseWards = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nurse/wards');
            setBeds(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load ward bed status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Ward & Bed Management</h2>
                <p className="font-body-lg text-on-surface-variant mt-1">Inpatient ward capacity, pre-allocated beds, and patient transfers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {beds.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-3xl border text-center text-on-surface-variant font-bold">
                        No ward beds pre-allocated currently.
                    </div>
                ) : beds.map((b) => (
                    <div key={b.id} className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="px-3 py-1 bg-rose-900 text-white rounded-xl font-mono font-extrabold text-sm">
                                {b.bedNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                                {b.wardCategory}
                            </span>
                        </div>
                        <div>
                            <div className="font-bold text-sm text-on-surface">👤 Patient: {b.patient?.user?.name}</div>
                            <div className="text-xs text-rose-700 font-mono">{b.patient?.patientCode}</div>
                        </div>
                        <p className="text-xs text-on-surface-variant border-t pt-2">{b.reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseWards;
