import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LabProcessing = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    
    // Form State for Results
    const [resultText, setResultText] = useState('');
    const [remarks, setRemarks] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetch both SAMPLE_COLLECTED and IN_PROGRESS
            const resCollected = await api.get('/lab/orders?status=SAMPLE_COLLECTED');
            const resInProgress = await api.get('/lab/orders?status=IN_PROGRESS');
            setOrders([...resCollected.data.data, ...resInProgress.data.data].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        } catch (err) {
            toast.error('Failed to load processing queue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStartProcessing = async (orderId) => {
        try {
            await api.put(`/lab/orders/${orderId}/process`);
            toast.success('Test status updated to In Progress');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleSubmitResult = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;
        
        try {
            await api.post(`/lab/orders/${selectedOrder.id}/result`, {
                resultText,
                remarks
            });
            toast.success('Lab result submitted successfully!');
            setShowResultModal(false);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to submit results');
        }
    };

    const openResultModal = (order) => {
        setSelectedOrder(order);
        setResultText('');
        setRemarks('');
        setShowResultModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-headline-md font-bold text-on-surface">Test Processing</h1>
                    <p className="text-sm font-body-md text-on-surface-variant">Process samples and enter results</p>
                </div>
                <button onClick={fetchOrders} className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors" title="Refresh">
                    <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
                </button>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                                <th className="p-4 font-label-md text-on-surface-variant">Patient</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Test Name</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Sample Details</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Status</th>
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
                                        No samples waiting for processing.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.patient?.user?.name}</div>
                                            <div className="text-xs font-label-sm text-on-surface-variant">ID: {order.patient?.patientCode}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.testName}</div>
                                            {order.priority === 'URGENT' && (
                                                <span className="inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-error/10 text-error">
                                                    URGENT
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-body-md text-on-surface">{order.sampleType || 'Unknown'}</div>
                                            <div className="text-xs text-on-surface-variant">Collected: {order.collectionDate ? new Date(order.collectionDate).toLocaleTimeString() : 'N/A'}</div>
                                        </td>
                                        <td className="p-4">
                                            {order.status === 'SAMPLE_COLLECTED' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-primary-container text-on-primary-container border-primary/20">
                                                    SAMPLE COLLECTED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-info/10 text-info border-info/30">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-info animate-pulse"></div>
                                                    IN PROGRESS
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {order.status === 'SAMPLE_COLLECTED' ? (
                                                <button 
                                                    onClick={() => handleStartProcessing(order.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-high text-on-surface rounded-lg text-sm font-label-md hover:bg-surface-container-highest transition-colors shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                                                    Start Test
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => openResultModal(order)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-on-success rounded-lg text-sm font-label-md hover:bg-success/90 transition-colors shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                                                    Enter Result
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enter Result Modal */}
            {showResultModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                            <h3 className="text-lg font-headline-sm font-bold text-on-surface">Enter Lab Results</h3>
                            <button onClick={() => setShowResultModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitResult} className="p-6 space-y-4">
                            
                            <div className="bg-surface-container rounded-xl p-3 mb-2 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-on-surface">{selectedOrder.patient?.user?.name}</p>
                                    <p className="text-xs text-on-surface-variant">Test: {selectedOrder.testName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-on-surface-variant">Doctor: Dr. {selectedOrder.doctor?.user?.name}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-label-md font-medium text-on-surface-variant mb-1">Result Data / Findings</label>
                                <textarea 
                                    required
                                    rows="6"
                                    value={resultText}
                                    onChange={(e) => setResultText(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
                                    placeholder="Enter test values, measurements, or findings here..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-label-md font-medium text-on-surface-variant mb-1">Technician Remarks (Optional)</label>
                                <textarea 
                                    rows="2"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                    placeholder="Any additional remarks..."
                                ></textarea>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowResultModal(false)}
                                    className="px-4 py-2 text-sm font-label-md font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-success text-on-success text-sm font-label-md font-bold rounded-xl hover:bg-success/90 transition-colors shadow-sm"
                                >
                                    Submit & Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabProcessing;
