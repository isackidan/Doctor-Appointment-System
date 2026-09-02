import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminPatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (searchQuery) params.search = searchQuery;
            const res = await api.get('/admin/patients', { params });
            setPatients(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPatients();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Centralized Patient Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Master directory of all hospital patients, electronic medical records, and billing ledger.</p>
                </div>
                <button
                    onClick={fetchPatients}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by Patient Code, Name, or Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Patients Master Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Patient Code</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Phone / Contact</th>
                                <th className="p-4">Blood Group</th>
                                <th className="p-4">Total Visits</th>
                                <th className="p-4">Prescriptions</th>
                                <th className="p-4">Lab Tests</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading patient records...</span>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-on-surface-variant">
                                        No patient records found.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((p) => (
                                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-mono font-bold text-blue-700">
                                            {p.patientCode}
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">
                                            {p.user?.name}
                                            <p className="text-[10px] text-on-surface-variant font-normal">{p.user?.email}</p>
                                        </td>
                                        <td className="p-4 text-on-surface-variant">{p.user?.phone || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                                {p.bloodGroup || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">{p.appointments?.length || 0}</td>
                                        <td className="p-4 text-on-surface">{p.prescriptions?.length || 0}</td>
                                        <td className="p-4 text-on-surface">{p.labRequests?.length || 0}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedPatient(p)}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                                                Full Medical Record
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Patient Full Medical Record Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl max-w-3xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-on-surface">{selectedPatient.user?.name}</h3>
                                <p className="text-xs text-on-surface-variant font-mono">
                                    Patient ID: {selectedPatient.patientCode} • Phone: {selectedPatient.user?.phone || 'N/A'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body Tabs / Sections */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                            {/* Personal & Clinical Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                                <div>
                                    <span className="text-[10px] text-on-surface-variant block font-bold">Blood Group</span>
                                    <span className="font-bold text-cyan-800">{selectedPatient.bloodGroup || 'Not set'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-on-surface-variant block font-bold">Gender / Age</span>
                                    <span className="font-bold">{selectedPatient.gender || 'N/A'} / {selectedPatient.age || 'N/A'} yrs</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-on-surface-variant block font-bold">Emergency Contact</span>
                                    <span className="font-bold">{selectedPatient.emergencyContact || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-on-surface-variant block font-bold">Known Allergies</span>
                                    <span className="font-bold text-rose-700">{selectedPatient.allergies || 'None'}</span>
                                </div>
                            </div>

                            {/* Appointments History */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1">
                                    Consultations & Visits ({selectedPatient.appointments?.length || 0})
                                </h4>
                                {selectedPatient.appointments?.length === 0 ? (
                                    <p className="text-on-surface-variant italic">No appointments on record.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {selectedPatient.appointments?.map((appt) => (
                                            <div key={appt.id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold">Dr. {appt.doctor?.user?.name} ({appt.department?.name || 'OPD'})</span>
                                                    <p className="text-[10px] text-on-surface-variant">{new Date(appt.date).toLocaleDateString()} at {appt.startTime}</p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-on-surface">
                                                    {appt.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Prescriptions History */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1">
                                    Prescriptions History ({selectedPatient.prescriptions?.length || 0})
                                </h4>
                                {selectedPatient.prescriptions?.length === 0 ? (
                                    <p className="text-on-surface-variant italic">No prescriptions issued.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedPatient.prescriptions?.map((presc) => (
                                            <div key={presc.id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold">Dr. {presc.doctor?.user?.name} • {new Date(presc.createdAt).toLocaleDateString()}</span>
                                                    <span className={`text-[10px] font-bold ${presc.dispensed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {presc.dispensed ? 'Dispensed' : 'Pending Pharmacy'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {presc.items?.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-surface-container rounded text-[10px] font-bold text-on-surface">
                                                            {item.medicineName} ({item.dosage} - {item.frequency})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lab Reports */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1">
                                    Lab & Diagnostics ({selectedPatient.labRequests?.length || 0})
                                </h4>
                                {selectedPatient.labRequests?.length === 0 ? (
                                    <p className="text-on-surface-variant italic">No lab tests requested.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedPatient.labRequests?.map((lab) => (
                                            <div key={lab.id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-on-surface">{lab.testName} ({lab.category})</span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-on-surface">
                                                        {lab.status}
                                                    </span>
                                                </div>
                                                {lab.labReport && (
                                                    <pre className="font-mono text-[11px] bg-surface p-2 rounded mt-1 text-on-surface whitespace-pre-wrap">
                                                        {lab.labReport.resultData}
                                                    </pre>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPatientManagement;
