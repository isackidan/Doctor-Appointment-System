import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LabResults = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lab/orders?status=COMPLETED');
            setOrders(res.data.data);
        } catch (err) {
            toast.error('Failed to load completed tests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const openReportModal = (order) => {
        setSelectedReport(order);
        setShowReportModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:space-y-0">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-headline-md font-bold text-on-surface">Lab Results</h1>
                    <p className="text-sm font-body-md text-on-surface-variant">View completed tests and reports</p>
                </div>
                <button onClick={fetchOrders} className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors" title="Refresh">
                    <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
                </button>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                                <th className="p-4 font-label-md text-on-surface-variant">Completed On</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Patient</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Test Name</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Doctor</th>
                                <th className="p-4 font-label-md text-on-surface-variant text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-on-surface-variant font-label-md">
                                        No completed tests found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-sm font-body-md text-on-surface">
                                            {new Date(order.updatedAt).toLocaleDateString()}
                                            <div className="text-xs text-on-surface-variant">{new Date(order.updatedAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.patient?.user?.name}</div>
                                            <div className="text-xs font-label-sm text-on-surface-variant">ID: {order.patient?.patientCode}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.testName}</div>
                                            <div className="text-xs text-on-surface-variant">{order.sampleType}</div>
                                        </td>
                                        <td className="p-4 text-sm font-body-md text-on-surface">
                                            Dr. {order.doctor?.user?.name}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openReportModal(order)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-sm font-label-md hover:bg-primary-container/80 transition-colors shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Report Modal / Print Area */}
            {showReportModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:relative print:p-0 print:bg-white print:block">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:rounded-none">
                        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest print:hidden">
                            <h3 className="text-lg font-headline-sm font-bold text-on-surface">Lab Report</h3>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg" title="Print">
                                    <span className="material-symbols-outlined">print</span>
                                </button>
                                <button onClick={() => setShowReportModal(false)} className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg" title="Close">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6 print:p-0">
                            {/* Header for print */}
                            <div className="text-center border-b border-outline-variant/30 pb-4">
                                <h2 className="text-2xl font-bold text-on-surface">Lumina Hospital ERP</h2>
                                <h3 className="text-lg font-semibold text-on-surface-variant mt-1">Laboratory Report</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm font-body-md border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                                <div>
                                    <p className="text-on-surface-variant">Patient Name:</p>
                                    <p className="font-bold text-on-surface">{selectedReport.patient?.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Patient ID:</p>
                                    <p className="font-bold text-on-surface">{selectedReport.patient?.patientCode}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Test Name:</p>
                                    <p className="font-bold text-on-surface">{selectedReport.testName}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Referred By:</p>
                                    <p className="font-bold text-on-surface">Dr. {selectedReport.doctor?.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Sample Collected On:</p>
                                    <p className="font-bold text-on-surface">
                                        {selectedReport.collectionDate ? new Date(selectedReport.collectionDate).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-on-surface-variant">Report Generated On:</p>
                                    <p className="font-bold text-on-surface">
                                        {selectedReport.updatedAt ? new Date(selectedReport.updatedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-bold text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Test Results</h4>
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
                                    <pre className="font-mono text-sm whitespace-pre-wrap text-on-surface">
                                        {selectedReport.labReport?.resultData || 'No result data available.'}
                                    </pre>
                                </div>
                            </div>

                            {selectedReport.labReport?.remarks && (
                                <div>
                                    <h4 className="text-md font-bold text-on-surface mb-2 border-b border-outline-variant/20 pb-1">Remarks</h4>
                                    <p className="text-sm text-on-surface">
                                        {selectedReport.labReport.remarks}
                                    </p>
                                </div>
                            )}

                            <div className="pt-12 flex justify-end">
                                <div className="text-center">
                                    <div className="w-40 border-b border-outline-variant/40 mb-2"></div>
                                    <p className="text-xs font-bold text-on-surface">Authorized Signatory</p>
                                    <p className="text-[10px] text-on-surface-variant">Lab Technician</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabResults;
