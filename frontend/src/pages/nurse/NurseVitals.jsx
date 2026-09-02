import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseVitals = () => {
    const [queue, setQueue] = useState([]);
    const [selectedApptId, setSelectedApptId] = useState('');
    const [loading, setLoading] = useState(true);

    const [vitalsForm, setVitalsForm] = useState({
        height: '170',
        weight: '68',
        bloodPressure: '120/80',
        pulseRate: '72',
        temperature: '98.6',
        respiratoryRate: '18',
        spo2: '98',
        bloodSugar: '105',
        painScale: '0',
        notes: 'Normal vital signs check'
    });

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nurse/queue');
            const data = res.data.data || [];
            setQueue(data);
            if (data.length > 0) setSelectedApptId(data[0].id);
        } catch (err) {
            toast.error('Failed to load triage queue');
        } finally {
            setLoading(false);
        }
    };

    // Calculate live BMI
    const calcBmi = () => {
        const h = parseFloat(vitalsForm.height);
        const w = parseFloat(vitalsForm.weight);
        if (h > 0 && w > 0) {
            const hM = h / 100;
            return (w / (hM * hM)).toFixed(2);
        }
        return '23.5';
    };

    const handleRecordVitals = async (e) => {
        e.preventDefault();
        if (!selectedApptId) {
            toast.error('Please select a patient from the queue');
            return;
        }
        try {
            await api.post(`/nurse/appointments/${selectedApptId}/vitals`, vitalsForm);
            toast.success('🩺 Vital Signs Recorded & BMI Calculated!');
            fetchQueue();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record vitals');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Vital Signs Tracker & Triage</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Record patient vitals, live BMI auto-calculation, and critical threshold detection.</p>
                </div>
            </div>

            {/* Select Patient Dropdown */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                <label className="text-xs font-bold block uppercase text-rose-900">Select Patient from Triage Queue *</label>
                <select
                    value={selectedApptId}
                    onChange={e => setSelectedApptId(e.target.value)}
                    className="w-full border-2 p-3 rounded-xl text-sm font-bold text-rose-950 outline-none focus:border-rose-500"
                >
                    {queue.length === 0 ? (
                        <option value="">No waiting patients in queue</option>
                    ) : queue.map(q => (
                        <option key={q.id} value={q.id}>
                            Token: {q.token?.tokenNumber || 'TK-101'} — {q.patient?.user?.name} ({q.patient?.patientCode}) — Dr. {q.doctor?.user?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Vitals Form Card */}
            <form onSubmit={handleRecordVitals} className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600">monitor_heart</span>
                        Record Vital Measurements
                    </h3>
                    <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold text-rose-900 font-mono">
                        Auto BMI: <span className="text-sm font-extrabold text-rose-700">{calcBmi()} kg/m²</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                        <label className="font-bold block mb-1">Temperature (°F) *</label>
                        <input
                            type="number" step="0.1" required
                            value={vitalsForm.temperature}
                            onChange={e => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                            className={`w-full border-2 p-3 rounded-xl font-mono font-bold text-sm outline-none ${
                                parseFloat(vitalsForm.temperature) > 100.4 ? 'border-rose-500 bg-rose-50 text-rose-900' : 'focus:border-rose-500'
                            }`}
                        />
                        {parseFloat(vitalsForm.temperature) > 100.4 && <span className="text-[10px] text-rose-600 font-bold">⚠️ High Fever Alert</span>}
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Blood Pressure (mmHg) *</label>
                        <input
                            type="text" required placeholder="120/80"
                            value={vitalsForm.bloodPressure}
                            onChange={e => setVitalsForm({...vitalsForm, bloodPressure: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Oxygen Saturation SpO2 (%) *</label>
                        <input
                            type="number" required
                            value={vitalsForm.spo2}
                            onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})}
                            className={`w-full border-2 p-3 rounded-xl font-mono font-bold text-sm outline-none ${
                                parseInt(vitalsForm.spo2) < 95 ? 'border-rose-500 bg-rose-50 text-rose-900' : 'focus:border-rose-500'
                            }`}
                        />
                        {parseInt(vitalsForm.spo2) < 95 && <span className="text-[10px] text-rose-600 font-bold">⚠️ Low SpO2 Hypoxia Alert</span>}
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Pulse Rate (bpm)</label>
                        <input
                            type="number"
                            value={vitalsForm.pulseRate}
                            onChange={e => setVitalsForm({...vitalsForm, pulseRate: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Respiratory Rate (/min)</label>
                        <input
                            type="number"
                            value={vitalsForm.respiratoryRate}
                            onChange={e => setVitalsForm({...vitalsForm, respiratoryRate: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Blood Sugar (mg/dL)</label>
                        <input
                            type="number"
                            value={vitalsForm.bloodSugar}
                            onChange={e => setVitalsForm({...vitalsForm, bloodSugar: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Height (cm)</label>
                        <input
                            type="number"
                            value={vitalsForm.height}
                            onChange={e => setVitalsForm({...vitalsForm, height: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            value={vitalsForm.weight}
                            onChange={e => setVitalsForm({...vitalsForm, weight: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Pain Scale (0-10)</label>
                        <input
                            type="number" min="0" max="10"
                            value={vitalsForm.painScale}
                            onChange={e => setVitalsForm({...vitalsForm, painScale: e.target.value})}
                            className="w-full border-2 p-3 rounded-xl font-mono font-bold text-sm focus:border-rose-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold block mb-1 uppercase">Triage Remarks & Nursing Notes</label>
                    <textarea
                        rows="2"
                        value={vitalsForm.notes}
                        onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})}
                        className="w-full border-2 p-3 rounded-xl text-sm focus:border-rose-500 outline-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all"
                >
                    💾 Save Vital Signs & Transition Status
                </button>
            </form>
        </div>
    );
};

export default NurseVitals;
