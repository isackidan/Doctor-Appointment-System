import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        todayCheckins: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        emergencyCount: 0,
        totalPatients: 0,
        todayTokens: []
    });
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showIPDModal, setShowIPDModal] = useState(false);

    const [selectedAppt, setSelectedAppt] = useState(null);
    const [ticketData, setTicketData] = useState(null);

    // Forms
    const [emergencyForm, setEmergencyForm] = useState({ name: '', phone: '', age: '35', gender: 'Male', doctorId: '', traumaRoom: 'ER-1', notes: 'Acute trauma intake' });
    const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', gender: 'Female', age: '28', doctorId: '', date: new Date().toISOString().split('T')[0], startTime: '10:00 AM' });
    const [rescheduleForm, setRescheduleForm] = useState({ date: new Date().toISOString().split('T')[0], startTime: '11:00 AM' });
    const [feeForm, setFeeForm] = useState({ amount: '550', paymentMethod: 'CASH' });
    const [ipdForm, setIpdForm] = useState({ patientId: '', wardCategory: 'General Ward', bedNumber: 'BED-204', reason: 'Inpatient Admission Recommended by Doctor' });

    useEffect(() => {
        fetchReceptionistData();
    }, []);

    const fetchReceptionistData = async () => {
        try {
            setLoading(true);
            const [statsRes, docRes] = await Promise.all([
                api.get('/receptionist/stats'),
                api.get('/receptionist/doctors')
            ]);
            setStats(statsRes.data.data);
            setDoctors(docRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load receptionist dashboard');
        } finally {
            setLoading(false);
        }
    };

    // 1. Emergency Fast-Track Intake
    const handleEmergencyIntake = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/receptionist/emergency-intake', emergencyForm);
            toast.success('🚨 Emergency Patient Fast-Tracked & Token Issued!');
            setShowEmergencyModal(false);
            setTicketData(res.data.data);
            setShowTicketModal(true);
            fetchReceptionistData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Emergency intake failed');
        }
    };

    // 2. Normal Patient Registration & OPD Token
    const handleRegisterPatient = async (e) => {
        e.preventDefault();
        try {
            const regRes = await api.post('/receptionist/patients', { name: regForm.name, phone: regForm.phone, email: regForm.email, gender: regForm.gender, age: regForm.age });
            const patient = regRes.data.data;
            const apptRes = await api.post('/receptionist/appointments', { patientId: patient.id, doctorId: regForm.doctorId || doctors[0]?.id, date: regForm.date, startTime: regForm.startTime });
            toast.success('Patient registered & OPD Token generated!');
            setShowRegModal(false);
            setTicketData(apptRes.data.data);
            setShowTicketModal(true);
            fetchReceptionistData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    // 3. Call Next Patient / Update Token Status
    const handleUpdateTokenStatus = async (tokenId, status) => {
        try {
            await api.put(`/receptionist/tokens/${tokenId}/status`, { status });
            toast.success(`Token status updated to ${status}`);
            fetchReceptionistData();
        } catch (err) {
            toast.error('Failed to update token status');
        }
    };

    // 4. IPD Bed Allocation Request
    const handleIPDBedRequest = async (e) => {
        e.preventDefault();
        try {
            const searchRes = await api.get('/receptionist/patients/search?query=');
            const pList = searchRes.data.data || [];
            const targetPatientId = ipdForm.patientId || pList[0]?.id;

            if (!targetPatientId) {
                toast.error('No patient available for IPD bed allocation');
                return;
            }

            await api.post('/receptionist/ipd-bed-request', {
                patientId: targetPatientId,
                wardCategory: ipdForm.wardCategory,
                bedNumber: ipdForm.bedNumber,
                reason: ipdForm.reason
            });
            toast.success('🛏️ IPD Bed Allocation Request Created!');
            setShowIPDModal(false);
        } catch (err) {
            toast.error('Failed to request IPD Bed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-purple-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-purple-200">
                        <span className="material-symbols-outlined text-[16px]">desk</span>
                        Hospital Reception & Triage Desk
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Patient Intake & Token Management</h1>
                    <p className="text-purple-200 text-sm max-w-xl">OPD registrations, emergency fast-track intake, live token queue matrix, and IPD bed requests.</p>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 animate-pulse"
                    >
                        <span className="material-symbols-outlined text-[18px]">emergency</span>
                        🚨 Emergency Intake
                    </button>
                    <button
                        onClick={() => setShowIPDModal(true)}
                        className="bg-purple-800 hover:bg-purple-700 text-white border border-purple-400 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">bed</span>
                        🛏️ IPD Bed Allocation
                    </button>
                    <button
                        onClick={() => setShowRegModal(true)}
                        className="bg-white text-purple-950 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        + New OPD Patient
                    </button>
                </div>
            </div>

            {/* Reception Dashboard KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Today's OPD</div>
                    <div className="text-3xl font-extrabold text-purple-700">{stats.todayAppointments || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Checked In</div>
                    <div className="text-3xl font-extrabold text-emerald-600">{stats.todayCheckins || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Pending Waiting</div>
                    <div className="text-3xl font-extrabold text-amber-600">{stats.pendingAppointments || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Emergency Intake</div>
                    <div className="text-3xl font-extrabold text-rose-600">{stats.emergencyCount || 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-on-surface-variant uppercase">Total Patients</div>
                    <div className="text-3xl font-extrabold text-indigo-700">{stats.totalPatients || 0}</div>
                </div>
            </div>

            {/* LIVE OPD TOKEN DISPLAY & CALL MATRIX */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600 text-[24px]">confirmation_number</span>
                            Live OPD Token Display & Call Queue ({stats.todayTokens?.length || 0})
                        </h3>
                        <p className="text-xs text-on-surface-variant">Real-time token status matrix with patient calling and status updates.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.todayTokens?.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-on-surface-variant text-sm">No OPD tokens generated for today yet.</div>
                    ) : stats.todayTokens?.map(token => (
                        <div key={token.tokenId} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-3 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 rounded-xl bg-purple-900 text-white font-mono font-extrabold text-lg shadow-sm">
                                    {token.tokenNumber}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    token.status === 'WAITING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                    token.status === 'IN_TRIAGE' ? 'bg-rose-100 text-rose-800 font-extrabold' :
                                    token.status === 'WITH_DOCTOR' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {token.status}
                                </span>
                            </div>

                            <div>
                                <div className="font-bold text-sm text-on-surface truncate">{token.patientName}</div>
                                <div className="text-[11px] text-purple-800 font-mono">{token.patientCode} • Dr. {token.doctorName}</div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t text-xs">
                                <button
                                    onClick={() => handleUpdateTokenStatus(token.tokenId, 'WITH_DOCTOR')}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg font-bold shadow-xs flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">volume_up</span> Call Next
                                </button>
                                <button
                                    onClick={() => handleUpdateTokenStatus(token.tokenId, 'SKIPPED')}
                                    className="px-2.5 py-1.5 border border-outline-variant/50 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL 1: EMERGENCY FAST-TRACK INTAKE */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-rose-600 text-[28px] animate-pulse">emergency</span>
                                <h3 className="text-2xl font-bold text-rose-950">🚨 Emergency Fast-Track Intake</h3>
                            </div>
                            <button onClick={() => setShowEmergencyModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleEmergencyIntake} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Emergency Patient Name *</label>
                                <input type="text" required value={emergencyForm.name} onChange={e => setEmergencyForm({...emergencyForm, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold text-rose-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Contact Phone</label>
                                    <input type="tel" value={emergencyForm.phone} onChange={e => setEmergencyForm({...emergencyForm, phone: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Trauma Room #</label>
                                    <select value={emergencyForm.traumaRoom} onChange={e => setEmergencyForm({...emergencyForm, traumaRoom: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold">
                                        <option value="ER-1">Trauma ER-1</option>
                                        <option value="ER-2">Trauma ER-2</option>
                                        <option value="ICU-T">ICU Triage</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Assign On-Call Emergency Doctor</label>
                                <select value={emergencyForm.doctorId} onChange={e => setEmergencyForm({...emergencyForm, doctorId: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold">
                                    <option value="">Select Doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.user?.name} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEmergencyModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-rose-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-rose-700">Issue Emergency Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: IPD BED PRE-ALLOCATION */}
            {showIPDModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-700 text-[28px]">bed</span>
                                <h3 className="text-2xl font-bold text-on-surface">🛏️ IPD Bed Allocation Request</h3>
                            </div>
                            <button onClick={() => setShowIPDModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleIPDBedRequest} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Select Ward Category</label>
                                <select value={ipdForm.wardCategory} onChange={e => setIpdForm({...ipdForm, wardCategory: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold text-purple-900">
                                    <option value="General Ward">General Ward</option>
                                    <option value="Semi-Private Ward">Semi-Private Ward</option>
                                    <option value="Deluxe Private Suite">Deluxe Private Suite</option>
                                    <option value="ICU (Intensive Care)">ICU (Intensive Care)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Pre-Assigned Bed #</label>
                                <input type="text" value={ipdForm.bedNumber} onChange={e => setIpdForm({...ipdForm, bedNumber: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono font-bold" />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Admission Reason & Notes</label>
                                <textarea rows="2" value={ipdForm.reason} onChange={e => setIpdForm({...ipdForm, reason: e.target.value})} className="w-full border p-3 rounded-xl text-sm"></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowIPDModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-purple-700 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-purple-800">Submit IPD Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: NORMAL OPD REGISTRATION */}
            {showRegModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-2xl font-bold text-on-surface">New OPD Patient Registration</h3>
                            <button onClick={() => setShowRegModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleRegisterPatient} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Patient Full Name *</label>
                                <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Phone Number *</label>
                                    <input type="tel" required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Age</label>
                                    <input type="number" value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Select Doctor</label>
                                <select value={regForm.doctorId} onChange={e => setRegForm({...regForm, doctorId: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold">
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.user?.name} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-purple-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-purple-700">Register & Generate Token</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistDashboard;
