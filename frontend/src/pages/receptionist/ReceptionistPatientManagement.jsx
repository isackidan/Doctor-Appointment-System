import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReceptionistPatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patient360Data, setPatient360Data] = useState(null);
    const [show360Modal, setShow360Modal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);
    const [activeTab, setActiveTab] = useState('visits');

    // Document Upload Form
    const [docForm, setDocForm] = useState({ name: 'Aadhaar / ID Card', fileUrl: '/uploads/id_proof.pdf', type: 'ID_PROOF' });

    useEffect(() => {
        fetchPatients();
    }, [search]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/receptionist/patients/search?query=${encodeURIComponent(search)}`);
            setPatients(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load patient directory');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen360Profile = async (patient) => {
        setSelectedPatient(patient);
        try {
            const res = await api.get(`/receptionist/patients/${patient.id}/360-history`);
            setPatient360Data(res.data.data);
            setShow360Modal(true);
        } catch (err) {
            toast.error('Failed to load Patient 360° profile');
        }
    };

    const handleSendWhatsAppTicket = async (apptId) => {
        try {
            const res = await api.get(`/receptionist/appointments/${apptId}/whatsapp-ticket`);
            const payload = res.data.data;
            if (payload.whatsappUrl) {
                window.open(payload.whatsappUrl, '_blank');
                toast.success('WhatsApp OPD Ticket payload opened!');
            } else {
                toast.error('Patient mobile number missing for WhatsApp');
            }
        } catch (err) {
            toast.error('Failed to generate WhatsApp ticket');
        }
    };

    const handleAttachDoc = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        try {
            await api.post(`/receptionist/patients/${selectedPatient.id}/documents`, docForm);
            toast.success('Document attached to patient profile!');
            setShowDocModal(false);
            if (show360Modal) handleOpen360Profile(selectedPatient);
        } catch (err) {
            toast.error('Failed to attach document');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Patient Directory & 360° Profiles</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Search patient records, view treatment timelines, attach documents, and send WhatsApp OPD tickets.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search by Patient Code (PAT-2026-0001), Name, Phone, or Appointment ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border-2 py-3 pl-11 pr-4 rounded-xl text-sm focus:border-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* Patient Directory Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">Registered Patients ({patients.length})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Patient Code & Name</th>
                                <th className="p-4">Contact & Address</th>
                                <th className="p-4">Demographics</th>
                                <th className="p-4">Insurance Info</th>
                                <th className="p-4 text-right">360° Profile Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {patients.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-on-surface">{row.user?.name}</div>
                                        <div className="text-xs text-purple-700 font-mono font-extrabold">{row.patientCode || 'PAT-2026-0001'}</div>
                                    </td>
                                    <td className="p-4 text-xs font-mono">
                                        {row.user?.phone}
                                        <div className="text-[11px] text-on-surface-variant font-sans">{row.city || 'Chennai'}, {row.state || 'Tamil Nadu'}</div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        {row.gender || 'Female'} • {row.age || 32} yrs • <span className="font-bold text-rose-600">{row.bloodGroup || 'O+'}</span>
                                    </td>
                                    <td className="p-4 text-xs font-mono">
                                        {row.insuranceProvider ? (
                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                                {row.insuranceProvider} ({row.policyNumber || 'POL-9921'})
                                            </span>
                                        ) : (
                                            <span className="text-on-surface-variant">Self Pay</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpen360Profile(row)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">history_edu</span>
                                                View 360° History
                                            </button>
                                            <button
                                                onClick={() => { setSelectedPatient(row); setShowDocModal(true); }}
                                                className="bg-purple-50 text-purple-900 border border-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100"
                                            >
                                                Attach Doc
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: PATIENT 360° PROFILE & VISIT HISTORY TIMELINE */}
            {show360Modal && patient360Data && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-2xl border-2 border-purple-300">
                                    {patient360Data.user?.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold text-on-surface">{patient360Data.user?.name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                            {patient360Data.patientCode}
                                        </span>
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1">
                                        📞 {patient360Data.user?.phone} • 🩸 {patient360Data.bloodGroup || 'O+'} • {patient360Data.gender}, {patient360Data.age} yrs
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShow360Modal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b gap-2 text-xs font-bold">
                            <button onClick={() => setActiveTab('visits')} className={`pb-2 px-3 border-b-2 ${activeTab === 'visits' ? 'border-purple-600 text-purple-800' : 'border-transparent text-on-surface-variant'}`}>
                                OPD Visits History ({patient360Data.appointments?.length || 0})
                            </button>
                            <button onClick={() => setActiveTab('docs')} className={`pb-2 px-3 border-b-2 ${activeTab === 'docs' ? 'border-purple-600 text-purple-800' : 'border-transparent text-on-surface-variant'}`}>
                                ID Documents & Insurance ({patient360Data.documents?.length || 0})
                            </button>
                        </div>

                        {/* TAB 1: VISITS & TREATMENT TIMELINE */}
                        {activeTab === 'visits' && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {patient360Data.appointments?.length === 0 ? (
                                    <div className="text-xs text-center py-6 text-on-surface-variant">No previous OPD visits recorded for this patient.</div>
                                ) : (
                                    patient360Data.appointments?.map(appt => (
                                        <div key={appt.id} className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2 text-xs">
                                            <div className="flex justify-between items-center font-bold text-purple-950">
                                                <span>Dr. {appt.doctor?.user?.name} ({appt.startTime})</span>
                                                <span className="font-mono text-purple-800">{new Date(appt.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-on-surface-variant">
                                                <strong>Diagnosis:</strong> {appt.diagnosis || 'General OPD Examination'}
                                            </div>
                                            <div className="flex justify-between items-center border-t pt-2">
                                                <span className="font-mono font-bold text-purple-900">Token: {appt.token?.tokenNumber || 'TK-101'}</span>
                                                <button
                                                    onClick={() => handleSendWhatsAppTicket(appt.id)}
                                                    className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                                                >
                                                    💬 Send WhatsApp Ticket
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB 2: DOCUMENTS */}
                        {activeTab === 'docs' && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {patient360Data.documents?.length === 0 ? (
                                    <div className="text-xs text-center py-6 text-on-surface-variant">No documents attached yet.</div>
                                ) : (
                                    patient360Data.documents?.map(doc => (
                                        <div key={doc.id} className="p-3 bg-surface-container-low rounded-xl border flex justify-between items-center text-xs font-mono">
                                            <span>📄 {doc.name} ({doc.type})</span>
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-700 font-bold underline">Download</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <button onClick={() => setShow360Modal(false)} className="w-full border p-3 rounded-xl font-bold text-xs">Close Profile</button>
                    </div>
                </div>
            )}

            {/* MODAL 2: ATTACH PATIENT DOCUMENT */}
            {showDocModal && selectedPatient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-2xl font-bold text-on-surface">Attach Patient Document</h3>
                            <button onClick={() => setShowDocModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleAttachDoc} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Document Name *</label>
                                <input type="text" required value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Document Type</label>
                                <select value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold">
                                    <option value="ID_PROOF">ID Proof (Aadhaar / Passport)</option>
                                    <option value="INSURANCE_CARD">Insurance E-Card</option>
                                    <option value="PREVIOUS_REPORTS">Previous Medical Report</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowDocModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-purple-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-purple-700">Attach Document</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistPatientManagement;
