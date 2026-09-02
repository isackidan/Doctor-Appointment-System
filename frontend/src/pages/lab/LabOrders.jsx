import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LabOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCollectModal, setShowCollectModal] = useState(false);
    
    // Form State
    const [sampleType, setSampleType] = useState('Blood');
    const [collectionDate, setCollectionDate] = useState(new Date().toISOString().slice(0, 16));
    const [sampleNotes, setSampleNotes] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lab/orders?status=PENDING');
            setOrders(res.data.data);
        } catch (err) {
            toast.error('Failed to load lab orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCollectSample = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;
        
        try {
            await api.put(`/lab/orders/${selectedOrder.id}/collect`, {
                sampleType,
                collectionDate,
                sampleNotes
            });
            toast.success('Sample collection recorded successfully!');
            setShowCollectModal(false);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to record sample collection');
        }
    };

    const openCollectModal = (order) => {
        setSelectedOrder(order);
        setSampleType('Blood');
        setCollectionDate(new Date().toISOString().slice(0, 16));
        setSampleNotes('');
        setShowCollectModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-headline-md font-bold text-on-surface">Lab Test Orders</h1>
                    <p className="text-sm font-body-md text-on-surface-variant">View and manage pending test orders</p>
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
                                <th className="p-4 font-label-md text-on-surface-variant">Date</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Patient</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Test Name</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Priority</th>
                                <th className="p-4 font-label-md text-on-surface-variant">Doctor</th>
                                <th className="p-4 font-label-md text-on-surface-variant text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-on-surface-variant font-label-md">
                                        No pending lab orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-sm font-body-md text-on-surface">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.patient?.user?.name}</div>
                                            <div className="text-xs font-label-sm text-on-surface-variant">ID: {order.patient?.patientCode}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-on-surface">{order.testName}</div>
                                            {order.notes && <div className="text-xs text-on-surface-variant italic truncate max-w-xs">{order.notes}</div>}
                                        </td>
                                        <td className="p-4">
                                            {order.priority === 'URGENT' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-error/10 text-error border-error/20 animate-pulse">
                                                    <span className="material-symbols-outlined text-[14px]">emergency</span>
                                                    URGENT
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-surface-container text-on-surface-variant border-outline-variant/30">
                                                    NORMAL
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-body-md text-on-surface">
                                            Dr. {order.doctor?.user?.name}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openCollectModal(order)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">vaccines</span>
                                                Collect Sample
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Collect Sample Modal */}
            {showCollectModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                            <h3 className="text-lg font-headline-sm font-bold text-on-surface">Record Sample Collection</h3>
                            <button onClick={() => setShowCollectModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCollectSample} className="p-6 space-y-4">
                            
                            <div className="bg-surface-container rounded-xl p-3 mb-2">
                                <p className="text-sm font-bold text-on-surface">{selectedOrder.patient?.user?.name}</p>
                                <p className="text-xs text-on-surface-variant">Test: {selectedOrder.testName}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-label-md font-medium text-on-surface-variant mb-1">Sample Type</label>
                                <select 
                                    required
                                    value={sampleType}
                                    onChange={(e) => setSampleType(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="Blood">Blood</option>
                                    <option value="Urine">Urine</option>
                                    <option value="Stool">Stool</option>
                                    <option value="Sputum">Sputum</option>
                                    <option value="Swab">Swab</option>
                                    <option value="Tissue">Tissue</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-label-md font-medium text-on-surface-variant mb-1">Collection Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    value={collectionDate}
                                    onChange={(e) => setCollectionDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-label-md font-medium text-on-surface-variant mb-1">Notes / Conditions (e.g. Fasting)</label>
                                <textarea 
                                    rows="2"
                                    value={sampleNotes}
                                    onChange={(e) => setSampleNotes(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                    placeholder="Any remarks about the sample..."
                                ></textarea>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCollectModal(false)}
                                    className="px-4 py-2 text-sm font-label-md font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-on-primary text-sm font-label-md font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    Confirm Collection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabOrders;
