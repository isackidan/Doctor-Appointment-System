import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminLabManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, priorityFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (priorityFilter !== 'ALL') params.priority = priorityFilter;

            const res = await api.get('/admin/lab-orders', { params });
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load lab orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Centralized Laboratory Monitor</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Track pathology orders, sample collection status, and completed test results.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {['ALL', 'PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === st ? 'bg-orange-600 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            {st.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant">Priority:</span>
                    {['ALL', 'URGENT', 'NORMAL'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPriorityFilter(p)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                priorityFilter === p
                                    ? p === 'URGENT' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                                    : 'bg-surface-container text-on-surface-variant'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lab Orders Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Date</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Test Name</th>
                                <th className="p-4">Referred By</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading lab orders...</span>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-on-surface-variant">
                                        No lab orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const isDone = order.status === 'COMPLETED' && order.labReport;
                                    return (
                                        <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 text-on-surface">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-on-surface">
                                                {order.patient?.user?.name}
                                                <p className="text-[10px] text-on-surface-variant font-normal">ID: {order.patient?.patientCode}</p>
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">{order.testName}</td>
                                            <td className="p-4 text-on-surface">Dr. {order.doctor?.user?.name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    order.priority === 'URGENT' ? 'bg-rose-100 text-rose-800 animate-pulse font-black' : 'bg-surface-container text-on-surface-variant'
                                                }`}>
                                                    {order.priority || 'NORMAL'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    isDone ? 'bg-emerald-100 text-emerald-800' :
                                                    order.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {isDone ? (
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition shadow-sm inline-flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        View Result
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-on-surface-variant italic">In Pipeline</span>
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

            {/* View Lab Result Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl max-w-xl w-full border border-outline-variant/30 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-base font-bold text-on-surface">Lab Report: {selectedOrder.testName}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-2 text-xs">
                            <p><span className="text-on-surface-variant">Patient:</span> <span className="font-bold">{selectedOrder.patient?.user?.name}</span></p>
                            <p><span className="text-on-surface-variant">Referred By:</span> <span className="font-bold">Dr. {selectedOrder.doctor?.user?.name}</span></p>
                            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
                                <span className="font-bold block mb-1">Result Findings:</span>
                                <pre className="font-mono text-xs text-on-surface whitespace-pre-wrap">
                                    {selectedOrder.labReport?.resultData || 'No data recorded.'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLabManagement;
