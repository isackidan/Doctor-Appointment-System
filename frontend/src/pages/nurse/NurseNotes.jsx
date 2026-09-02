import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NurseNotes = () => {
    const [noteForm, setNoteForm] = useState({
        appointmentId: '',
        consciousLevel: 'Alert',
        mobility: 'Ambulatory',
        foodIntake: 'Normal',
        urineOutput: 'Adequate',
        sleepStatus: 'Restful',
        painLevel: '0',
        notes: 'Routine nursing care observation completed'
    });

    const handleSaveNote = async (e) => {
        e.preventDefault();
        try {
            const queueRes = await api.get('/nurse/queue');
            const qList = queueRes.data.data || [];
            const targetApptId = noteForm.appointmentId || qList[0]?.id;

            if (!targetApptId) {
                toast.error('No patient appointment available for note');
                return;
            }

            await api.post(`/nurse/appointments/${targetApptId}/notes`, noteForm);
            toast.success('📝 Nursing Observation Note Logged!');
            setNoteForm({ ...noteForm, notes: '' });
        } catch (err) {
            toast.error('Failed to log nursing note');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Nursing Observation Notes Log</h2>
                <p className="font-body-lg text-on-surface-variant mt-1">Record patient care observations, mobility, and clinical actions taken.</p>
            </div>

            <form onSubmit={handleSaveNote} className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                        <label className="block mb-1 uppercase">Conscious Level</label>
                        <select value={noteForm.consciousLevel} onChange={e => setNoteForm({...noteForm, consciousLevel: e.target.value})} className="w-full border p-3 rounded-xl">
                            <option value="Alert">Alert & Oriented</option>
                            <option value="Drowsy">Drowsy</option>
                            <option value="Confused">Confused</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 uppercase">Mobility Status</label>
                        <select value={noteForm.mobility} onChange={e => setNoteForm({...noteForm, mobility: e.target.value})} className="w-full border p-3 rounded-xl">
                            <option value="Ambulatory">Ambulatory (Walks independently)</option>
                            <option value="Assisted">Assisted Walking</option>
                            <option value="Bedrest">Strict Bedrest</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold block mb-1 uppercase text-on-surface">Detailed Nursing Observations & Actions Taken *</label>
                    <textarea
                        rows="4" required
                        value={noteForm.notes}
                        onChange={e => setNoteForm({...noteForm, notes: e.target.value})}
                        className="w-full border-2 p-3.5 rounded-2xl text-sm focus:border-rose-500 outline-none font-semibold"
                    ></textarea>
                </div>

                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md">
                    📝 Log Nursing Observation Note
                </button>
            </form>
        </div>
    );
};

export default NurseNotes;
