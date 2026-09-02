import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LabPatientSearch = () => {
    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            setLoading(true);
            const res = await api.get(`/lab/patients/search?query=${encodeURIComponent(query)}`);
            setPatients(res.data.data);
            setHasSearched(true);
            setSelectedPatient(null);
        } catch (err) {
            toast.error('Failed to search patients');
        } finally {
            setLoading(false);
        }
    };

    const viewHistory = (patient) => {
        setSelectedPatient(patient);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-headline-md font-bold text-on-surface">Patient Lab History</h1>
                <p className="text-sm font-body-md text-on-surface-variant">Search for patients to view past lab reports</p>
            </div>

            {/* Search Bar */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-on-surface-variant text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by Patient Name, ID or Phone number..."
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-on-primary font-label-md font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Search'}
                    </button>
                </form>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Search Results */}
                <div className="lg:col-span-1 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden h-[600px] flex flex-col">
                    <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
                        <h2 className="text-sm font-label-lg font-bold text-on-surface">Search Results</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : hasSearched && patients.length === 0 ? (
                            <div className="text-center p-8 text-sm text-on-surface-variant font-label-md">
                                No patients found matching '{query}'
                            </div>
                        ) : !hasSearched ? (
                            <div className="text-center p-8 text-sm text-on-surface-variant font-label-md flex flex-col items-center opacity-60">
                                <span className="material-symbols-outlined text-[48px] mb-2">person_search</span>
                                Enter a search query to begin
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {patients.map((patient) => (
                                    <li key={patient.id}>
                                        <button 
                                            onClick={() => viewHistory(patient)}
                                            className={`w-full text-left p-3 rounded-xl transition-colors ${
                                                selectedPatient?.id === patient.id 
                                                ? 'bg-primary-container text-on-primary-container border-primary/20 border' 
                                                : 'hover:bg-surface-container border border-transparent'
                                            }`}
                                        >
                                            <div className="font-bold text-sm">{patient.user?.name}</div>
                                            <div className="text-xs mt-1 flex justify-between">
                                                <span>ID: {patient.patientCode}</span>
                                                <span>{patient.user?.phone}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Lab History */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden h-[600px] flex flex-col">
                    {selectedPatient ? (
                        <>
                            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-headline-sm font-bold text-on-surface">{selectedPatient.user?.name}'s Lab History</h2>
                                    <p className="text-xs text-on-surface-variant">Patient ID: {selectedPatient.patientCode}</p>
                                </div>
                                <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant border border-outline-variant/20">
                                    Total Tests: {selectedPatient.labRequests?.length || 0}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {!selectedPatient.labRequests || selectedPatient.labRequests.length === 0 ? (
                                    <div className="text-center p-12 text-on-surface-variant font-label-md">
                                        <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">science</span>
                                        <p>No lab tests found for this patient.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedPatient.labRequests.map((request) => (
                                            <div key={request.id} className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest hover:border-primary/30 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-on-surface">{request.testName}</h3>
                                                        <p className="text-xs text-on-surface-variant mt-0.5">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        {request.status === 'COMPLETED' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-success/10 text-success border-success/20">
                                                                COMPLETED
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-warning/10 text-warning border-warning/20">
                                                                {request.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {request.status === 'COMPLETED' && request.labReport && (
                                                    <div className="mt-3 bg-surface border border-outline-variant/20 rounded-lg p-3">
                                                        <p className="text-xs font-bold text-on-surface-variant mb-1">Result Data:</p>
                                                        <pre className="text-sm font-mono text-on-surface whitespace-pre-wrap">
                                                            {request.labReport.resultData}
                                                        </pre>
                                                        {request.labReport.remarks && (
                                                            <p className="text-xs text-on-surface-variant mt-2 italic">
                                                                Remarks: {request.labReport.remarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-on-surface-variant opacity-60">
                            <span className="material-symbols-outlined text-[64px] mb-4">clinical_notes</span>
                            <h2 className="text-lg font-headline-sm font-bold">Select a Patient</h2>
                            <p className="text-sm mt-1 text-center">Click on a patient from the search results to view their detailed lab history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabPatientSearch;
