import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientLabReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchLabReports();
    }, []);

    const fetchLabReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/lab-reports');
            setReports(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load lab reports');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Diagnostic & Lab Reports</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Access your medical test findings, pathology reports, and doctor diagnostics.</p>
                </div>
                <button
                    onClick={fetchLabReports}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Reports Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Request Date</th>
                                <th className="p-4">Test Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Referred By</th>
                                <th className="p-4">Result Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading lab reports...</span>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">science</span>
                                        <p className="font-bold">No lab reports on file.</p>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((req) => {
                                    const isReady = req.status === 'COMPLETED' && req.labReport;

                                    return (
                                        <tr key={req.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 text-on-surface">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">
                                                {req.testName}
                                            </td>
                                            <td className="p-4 text-on-surface-variant">
                                                {req.category || 'General Pathology'}
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">
                                                Dr. {req.doctor?.user?.name}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    isReady ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                    req.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                    'bg-amber-100 text-amber-800 border-amber-200'
                                                }`}>
                                                    {isReady ? 'Result Ready' : req.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {isReady ? (
                                                    <button
                                                        onClick={() => setSelectedReport(req)}
                                                        className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition shadow-sm inline-flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">description</span>
                                                        View Report
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-on-surface-variant italic">
                                                        Sample Processing...
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View & Print Report Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
                    <div className="bg-surface rounded-2xl max-w-2xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden print:shadow-none print:border-none print:w-full">
                        {/* Modal Header */}
                        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between print:hidden">
                            <h3 className="text-base font-bold text-on-surface">Pathology & Laboratory Report</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-cyan-700 transition"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span> Print
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-1 text-on-surface-variant hover:text-rose-600 transition"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Printable Content */}
                        <div className="p-8 space-y-6 text-on-surface">
                            <div className="text-center border-b border-outline-variant/30 pb-4">
                                <h2 className="text-2xl font-black text-cyan-800">Lumina Health & Research Hospital</h2>
                                <p className="text-xs text-on-surface-variant">Department of Laboratory Medicine & Diagnostics</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs border border-outline-variant/20 p-4 rounded-xl bg-surface-container-lowest">
                                <div>
                                    <p className="text-on-surface-variant">Test Name:</p>
                                    <p className="font-bold text-sm text-on-surface">{selectedReport.testName}</p>
                                    <p className="text-on-surface-variant">Category: {selectedReport.category || 'Clinical Pathology'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant">Referred By:</p>
                                    <p className="font-bold text-on-surface">Dr. {selectedReport.doctor?.user?.name}</p>
                                    <p className="text-on-surface-variant">Date: {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Result Box */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">Test Findings & Values</h4>
                                <div className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                                    <pre className="font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
                                        {selectedReport.labReport?.resultData || 'No diagnostic notes available.'}
                                    </pre>
                                </div>
                            </div>

                            {selectedReport.labReport?.remarks && (
                                <div className="bg-surface-container p-3 rounded-xl text-xs">
                                    <span className="font-bold text-on-surface">Technician Remarks: </span>
                                    <span className="text-on-surface-variant">{selectedReport.labReport.remarks}</span>
                                </div>
                            )}

                            {/* Signatures */}
                            <div className="pt-8 border-t border-outline-variant/30 flex justify-between items-end text-xs">
                                <div>
                                    <p className="text-[10px] text-on-surface-variant">Verified by Lumina Laboratory Quality Assurance.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-36 border-b border-outline-variant/40 mb-1"></div>
                                    <p className="text-[10px] font-bold text-on-surface">Chief Pathologist / Lab Tech</p>
                                    <p className="text-[9px] text-on-surface-variant">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientLabReports;
