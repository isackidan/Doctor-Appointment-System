import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorConsultation = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('vitals'); // ehr | vitals | exam | diagnosis | prescription | lab | certificates
    const [patientHistory, setPatientHistory] = useState(null);
    const [allMedicines, setAllMedicines] = useState([]);
    const [medSearch, setMedSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Form Data
    const [clinicalForm, setClinicalForm] = useState({
        chiefComplaint: 'Fever, Severe Headache, Cough for 3 days',
        symptoms: 'High grade fever (102°F), chills, body pain, fatigue',
        examination: 'Chest clear, Throat congested, Abdomen soft',
        diagnosis: 'Acute Upper Respiratory Tract Infection (URTI)',
        secondaryDiagnosis: 'Mild Dehydration',
        clinicalNotes: 'Advised rest for 3 days, drink plenty of fluids.',
        treatmentPlan: 'Symptomatic medical management & hydration',
        followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    });

    // Rx Builder Items
    const [rxItems, setRxItems] = useState([
        { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', durationDays: 5, timing: 'After Food', route: 'Oral', quantity: 10 }
    ]);

    // Lab Order Form
    const [labForm, setLabForm] = useState({ testName: 'Complete Blood Count (CBC)', category: 'General Pathology', priority: 'NORMAL', notes: 'Routine check' });

    // Document Generator State
    const [generatedDoc, setGeneratedDoc] = useState(null);

    useEffect(() => {
        if (appointmentId) fetchConsultationData();
        api.get('/doctor/medicines/search?q=')
            .then(r => setAllMedicines(r.data.data || []))
            .catch(() => {});
    }, [appointmentId]);

    const fetchConsultationData = async () => {
        try {
            setLoading(true);
            const apptRes = await api.get('/doctor/appointments?dateFilter=ALL');
            const currentAppt = apptRes.data.data?.find(a => a.id === appointmentId);

            if (currentAppt?.patientId) {
                const histRes = await api.get(`/doctor/patient-history/${currentAppt.patientId}`);
                setPatientHistory(histRes.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load consultation session');
        } finally {
            setLoading(false);
        }
    };

    // Save Clinical Findings
    const handleSaveClinicalNotes = async () => {
        try {
            await api.put(`/doctor/appointments/${appointmentId}/consultation`, clinicalForm);
            toast.success('Clinical consultation notes saved!');
        } catch (err) {
            toast.error('Failed to save consultation notes');
        }
    };

    // Save Rx & Auto-Post to Pharmacy Queue
    const handleSaveRx = async () => {
        try {
            await api.post(`/doctor/appointments/${appointmentId}/prescription`, {
                notes: clinicalForm.clinicalNotes,
                items: rxItems
            });
            toast.success('Prescription sent to Pharmacy Queue! 💊');
        } catch (err) {
            toast.error('Failed to save prescription');
        }
    };

    // Create Lab Order
    const handleSendLabOrder = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/doctor/appointments/${appointmentId}/lab-request`, labForm);
            toast.success('Lab Test Order sent to Lab Technician Queue! 🧪');
            fetchConsultationData();
        } catch (err) {
            toast.error('Failed to send lab order');
        }
    };

    // Doctor Acknowledge Lab Result
    const handleAcknowledgeLab = async (labRequestId) => {
        try {
            await api.put(`/doctor/lab-requests/${labRequestId}/acknowledge`, { remarks: 'Reviewed by Doctor - Normal' });
            toast.success('Lab Result Reviewed & Acknowledged! ✅');
            fetchConsultationData();
        } catch (err) {
            toast.error('Failed to acknowledge lab result');
        }
    };

    // Generate Document PDF Payload
    const handleGenerateDoc = async (documentType) => {
        try {
            const res = await api.get(`/doctor/appointments/${appointmentId}/document?documentType=${documentType}`);
            setGeneratedDoc(res.data.data);
            toast.success(`${documentType.replace('_', ' ')} Generated!`);
        } catch (err) {
            toast.error('Failed to generate document');
        }
    };

    // Complete Consultation
    const handleCompleteConsultation = async () => {
        try {
            await handleSaveClinicalNotes();
            await handleSaveRx();
            await api.put(`/doctor/appointments/${appointmentId}/complete`);
            toast.success('Consultation Completed! Returning to OPD Queue...');
            navigate('/doctor/queue');
        } catch (err) {
            toast.error('Failed to complete consultation');
        }
    };

    // Rx Add Item
    const addRxRow = () => {
        setRxItems([...rxItems, { medicineName: 'Amoxicillin 500mg', dosage: '500mg', frequency: '1-0-1', durationDays: 5, timing: 'After Food', route: 'Oral', quantity: 10 }]);
    };

    const removeRxRow = (idx) => {
        setRxItems(rxItems.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Top Bar with Patient Summary */}
            <div className="bg-teal-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-200">Clinical Consultation Room</div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">
                        👤 {patientHistory?.user?.name || 'Patient Consultation'}
                    </h1>
                    <p className="text-teal-200 text-xs font-mono">
                        {patientHistory?.patientCode || 'PAT-2026-0001'} • Gender: {patientHistory?.gender || 'Male'} • Age: {patientHistory?.age || 30} yrs • Blood: {patientHistory?.bloodGroup || 'O+'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSaveClinicalNotes} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20">
                        💾 Save Notes
                    </button>
                    <button onClick={handleCompleteConsultation} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-md">
                        ✓ Complete Consultation
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap border-b border-outline-variant/30 gap-2 text-xs font-bold bg-white p-3 rounded-2xl shadow-sm">
                {[
                    { key: 'vitals', label: '1. Vitals & Complaints', icon: 'monitor_heart' },
                    { key: 'exam', label: '2. Examination & Symptoms', icon: 'clinical_notes' },
                    { key: 'diagnosis', label: '3. Diagnosis Engine', icon: 'stethoscope' },
                    { key: 'prescription', label: '4. Rx Prescription Builder', icon: 'prescriptions' },
                    { key: 'lab', label: '5. Lab Orders & Review', icon: 'science' },
                    { key: 'certificates', label: '6. Medical Certificates PDF', icon: 'workspace_premium' },
                    { key: 'ehr', label: '7. Patient 360° EHR History', icon: 'history_edu' }
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === t.key ? 'bg-teal-700 text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-teal-100'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: VITALS & CHIEF COMPLAINTS */}
            {activeTab === 'vitals' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">monitor_heart</span>
                        Vitals & Chief Complaints
                    </h3>

                    {/* Vitals Summary Card */}
                    {patientHistory?.vitals?.[0] && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs font-mono">
                            <div>BP: <strong>{patientHistory.vitals[0].bloodPressure || '120/80'} mmHg</strong></div>
                            <div>Pulse: <strong>{patientHistory.vitals[0].pulseRate || 72} bpm</strong></div>
                            <div>Temp: <strong>{patientHistory.vitals[0].temperature || 98.6}°F</strong></div>
                            <div>SpO2: <strong>{patientHistory.vitals[0].spo2 || 98}%</strong></div>
                            <div>BMI: <strong>{patientHistory.vitals[0].bmi || '22.4'}</strong></div>
                            <div>Sugar: <strong>{patientHistory.vitals[0].bloodSugar || 100} mg/dL</strong></div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold block mb-1 text-on-surface uppercase">Chief Complaints *</label>
                        <textarea
                            rows="3"
                            value={clinicalForm.chiefComplaint}
                            onChange={e => setClinicalForm({ ...clinicalForm, chiefComplaint: e.target.value })}
                            className="w-full border-2 p-3 rounded-2xl text-sm font-semibold focus:border-teal-500 outline-none"
                            placeholder="Primary reason for visit e.g. High fever, headache..."
                        ></textarea>
                    </div>
                </div>
            )}

            {/* TAB 2: EXAMINATION & SYMPTOMS */}
            {activeTab === 'exam' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">clinical_notes</span>
                        Symptoms & Clinical Examination Findings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold block mb-1 uppercase">Symptoms Reported</label>
                            <input
                                type="text"
                                value={clinicalForm.symptoms}
                                onChange={e => setClinicalForm({ ...clinicalForm, symptoms: e.target.value })}
                                className="w-full border-2 p-3 rounded-xl text-sm focus:border-teal-500 outline-none font-semibold"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold block mb-1 uppercase">Physical Examination Findings</label>
                            <textarea
                                rows="3"
                                value={clinicalForm.examination}
                                onChange={e => setClinicalForm({ ...clinicalForm, examination: e.target.value })}
                                className="w-full border-2 p-3 rounded-xl text-sm focus:border-teal-500 outline-none font-semibold"
                            ></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: DIAGNOSIS ENGINE */}
            {activeTab === 'diagnosis' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">stethoscope</span>
                        Diagnosis Engine (Primary & Secondary)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1 uppercase">Primary Diagnosis *</label>
                            <input
                                type="text" required
                                value={clinicalForm.diagnosis}
                                onChange={e => setClinicalForm({ ...clinicalForm, diagnosis: e.target.value })}
                                className="w-full border-2 p-3 rounded-xl text-sm font-bold text-teal-900 focus:border-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1 uppercase">Secondary Diagnosis</label>
                            <input
                                type="text"
                                value={clinicalForm.secondaryDiagnosis}
                                onChange={e => setClinicalForm({ ...clinicalForm, secondaryDiagnosis: e.target.value })}
                                className="w-full border-2 p-3 rounded-xl text-sm focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1 uppercase">Clinical Notes & Treatment Plan</label>
                        <textarea
                            rows="3"
                            value={clinicalForm.clinicalNotes}
                            onChange={e => setClinicalForm({ ...clinicalForm, clinicalNotes: e.target.value })}
                            className="w-full border-2 p-3 rounded-xl text-sm focus:border-teal-500 outline-none font-semibold"
                        ></textarea>
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1 uppercase">Follow-up Date</label>
                        <input
                            type="date"
                            value={clinicalForm.followUpDate}
                            onChange={e => setClinicalForm({ ...clinicalForm, followUpDate: e.target.value })}
                            className="border-2 p-3 rounded-xl text-sm font-mono font-bold focus:border-teal-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* TAB 4: PRESCRIPTION BUILDER (AUTO-ROUTES TO PHARMACY) */}
            {activeTab === 'prescription' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-600">prescriptions</span>
                                Rx Prescription Builder (Auto-Posts to Pharmacy Queue)
                            </h3>
                            <p className="text-xs text-on-surface-variant">Selected medicines will automatically populate in the Pharmacy Counter queue.</p>
                        </div>
                        <button onClick={addRxRow} className="bg-teal-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:bg-teal-700">
                            + Add Medicine
                        </button>
                    </div>

                    <div className="space-y-4">
                        {rxItems.map((item, idx) => (
                            <div key={idx} className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-xs">
                                <div className="md:col-span-2">
                                    <label className="font-bold block mb-1 text-[10px] uppercase">Medicine Name</label>
                                    <input
                                        type="text"
                                        value={item.medicineName}
                                        onChange={e => {
                                            const newArr = [...rxItems];
                                            newArr[idx].medicineName = e.target.value;
                                            setRxItems(newArr);
                                        }}
                                        className="w-full border p-2 rounded-lg font-bold"
                                        placeholder="e.g. Paracetamol 500mg"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold block mb-1 text-[10px] uppercase">Frequency</label>
                                    <select
                                        value={item.frequency}
                                        onChange={e => {
                                            const newArr = [...rxItems];
                                            newArr[idx].frequency = e.target.value;
                                            setRxItems(newArr);
                                        }}
                                        className="w-full border p-2 rounded-lg font-bold"
                                    >
                                        <option value="1-0-1">1-0-1 (Twice daily)</option>
                                        <option value="1-1-1">1-1-1 (Thrice daily)</option>
                                        <option value="1-0-0">1-0-0 (Morning only)</option>
                                        <option value="0-0-1">0-0-1 (Night only)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold block mb-1 text-[10px] uppercase">Duration (Days)</label>
                                    <input
                                        type="number" min="1"
                                        value={item.durationDays}
                                        onChange={e => {
                                            const newArr = [...rxItems];
                                            newArr[idx].durationDays = e.target.value;
                                            setRxItems(newArr);
                                        }}
                                        className="w-full border p-2 rounded-lg font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold block mb-1 text-[10px] uppercase">Timing</label>
                                    <select
                                        value={item.timing}
                                        onChange={e => {
                                            const newArr = [...rxItems];
                                            newArr[idx].timing = e.target.value;
                                            setRxItems(newArr);
                                        }}
                                        className="w-full border p-2 rounded-lg font-bold"
                                    >
                                        <option value="After Food">After Food</option>
                                        <option value="Before Food">Before Food</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                    <button onClick={() => removeRxRow(idx)} className="text-rose-500 font-bold hover:underline">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleSaveRx} className="bg-teal-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md hover:bg-teal-700">
                        💾 Save Prescription & Send to Pharmacy
                    </button>
                </div>
            )}

            {/* TAB 5: LAB ORDERS & RESULTS REVIEW */}
            {activeTab === 'lab' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">science</span>
                        Lab Investigation Orders & Results Review
                    </h3>

                    {/* Create Lab Order Form */}
                    <form onSubmit={handleSendLabOrder} className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-4">
                        <div className="font-bold text-xs text-teal-900 uppercase">Order New Lab Test</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                                <label className="font-bold block mb-1">Test Name *</label>
                                <input type="text" required value={labForm.testName} onChange={e => setLabForm({ ...labForm, testName: e.target.value })} className="w-full border p-2.5 rounded-xl font-bold" />
                            </div>
                            <div>
                                <label className="font-bold block mb-1">Category</label>
                                <select value={labForm.category} onChange={e => setLabForm({ ...labForm, category: e.target.value })} className="w-full border p-2.5 rounded-xl font-bold">
                                    <option value="General Pathology">General Pathology</option>
                                    <option value="Hematology">Hematology</option>
                                    <option value="Biochemistry">Biochemistry</option>
                                    <option value="Radiology">Radiology / X-Ray</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold block mb-1">Priority</label>
                                <select value={labForm.priority} onChange={e => setLabForm({ ...labForm, priority: e.target.value })} className="w-full border p-2.5 rounded-xl font-bold">
                                    <option value="NORMAL">Normal</option>
                                    <option value="URGENT">Urgent (Stat)</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md">
                            Send Order to Lab Technician
                        </button>
                    </form>

                    {/* Completed Lab Orders Review Table */}
                    <div className="space-y-3">
                        <div className="font-bold text-xs text-on-surface uppercase">Ordered Lab Tests & Review Status</div>
                        {patientHistory?.labRequests?.map(lab => (
                            <div key={lab.id} className="p-4 bg-surface-container-low rounded-2xl border space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-on-surface text-sm">🧪 {lab.testName} ({lab.category})</div>
                                        <div className="text-[11px] text-on-surface-variant font-mono">
                                            Priority: <strong className={lab.priority === 'URGENT' ? 'text-rose-600' : 'text-teal-700'}>{lab.priority}</strong> • Status: <strong className="text-emerald-700">{lab.status}</strong>
                                        </div>
                                    </div>
                                    {lab.status === 'COMPLETED' && (
                                        <button onClick={() => handleAcknowledgeLab(lab.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                                            Acknowledge Result
                                        </button>
                                    )}
                                </div>

                                {/* Display Lab Technician Result if completed */}
                                {lab.labReport && (
                                    <div className="mt-2 p-3 bg-white rounded-xl border border-teal-100 space-y-1">
                                        <div className="font-bold text-[11px] text-teal-900 uppercase">Lab Findings / Result:</div>
                                        <pre className="font-mono text-xs whitespace-pre-wrap text-teal-950 bg-teal-50/50 p-2.5 rounded-lg border border-teal-200">{lab.labReport.resultData}</pre>
                                        {lab.labReport.remarks && (
                                            <div className="text-[11px] text-teal-800"><strong>Technician Remarks:</strong> {lab.labReport.remarks}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 6: MEDICAL CERTIFICATES & PDF GENERATOR */}
            {activeTab === 'certificates' && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">workspace_premium</span>
                        Medical Certificates & Printable Document Generator
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { type: 'MEDICAL_CERTIFICATE', title: 'Medical Leave Certificate', icon: 'medical_services' },
                            { type: 'FITNESS_CERTIFICATE', title: 'Fitness Certificate', icon: 'health_and_safety' },
                            { type: 'PRESCRIPTION_TICKET', title: 'Prescription PDF Ticket', icon: 'receipt' },
                            { type: 'REFERRAL_LETTER', title: 'Specialist Referral Letter', icon: 'mail' }
                        ].map(doc => (
                            <button
                                key={doc.type}
                                onClick={() => handleGenerateDoc(doc.type)}
                                className="p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-center transition-all space-y-2 hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-[32px] text-teal-700 block">{doc.icon}</span>
                                <div className="font-bold text-xs text-teal-950">{doc.title}</div>
                            </button>
                        ))}
                    </div>

                    {/* Generated Certificate Display */}
                    {generatedDoc && (
                        <div className="p-6 bg-surface-container-lowest rounded-3xl border border-teal-300 space-y-3 font-mono text-xs shadow-inner">
                            <div className="text-center font-bold text-sm text-teal-900 border-b pb-2">LUMINA HEALTH SYSTEM - OFFICIAL MEDICAL DOCUMENT</div>
                            <div className="flex justify-between"><span>Doc Ref: {generatedDoc.docRef}</span><span>Date: {generatedDoc.date}</span></div>
                            <div>👤 <strong>Patient:</strong> {generatedDoc.patientName} ({generatedDoc.patientAge} yrs, {generatedDoc.patientGender})</div>
                            <div>👨‍⚕️ <strong>Doctor:</strong> Dr. {generatedDoc.doctorName} ({generatedDoc.specialization})</div>
                            <div>🩺 <strong>Diagnosis:</strong> {generatedDoc.diagnosis}</div>
                            <div>📝 <strong>Clinical Notes:</strong> {generatedDoc.notes}</div>
                            <button onClick={() => window.print()} className="mt-2 bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">print</span> Print Official Document
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 7: PATIENT 360° EHR HISTORY */}
            {activeTab === 'ehr' && patientHistory && (
                <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4 text-xs">
                    <h3 className="font-bold text-lg text-on-surface">Patient 360° EHR Medical Record Summary</h3>
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 font-mono space-y-1">
                        <div>Patient Code: <strong>{patientHistory.patientCode}</strong></div>
                        <div>Address: {patientHistory.address || 'Chennai'}</div>
                        <div>Medical History: {patientHistory.medicalHistory || 'None'}</div>
                        <div>Allergies: {patientHistory.allergies || 'No known drug allergies'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorConsultation;
