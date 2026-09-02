import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminPharmacyManagement = () => {
    const [data, setData] = useState({ prescriptions: [], inventory: [], lowStockCount: 0 });
    const [tab, setTab] = useState('inventory');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPharmacyOverview();
    }, []);

    const fetchPharmacyOverview = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/pharmacy');
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load pharmacy overview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Pharmacy & Inventory Oversight</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Centralized tracking of hospital prescriptions, live drug stock, and reorder alerts.</p>
                </div>
                <button
                    onClick={fetchPharmacyOverview}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface-container rounded-2xl max-w-xs">
                <button
                    onClick={() => setTab('inventory')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tab === 'inventory' ? 'bg-surface text-emerald-800 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    Stock ({data.inventory?.length || 0})
                </button>
                <button
                    onClick={() => setTab('prescriptions')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tab === 'prescriptions' ? 'bg-surface text-emerald-800 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                    Rx Queue ({data.prescriptions?.length || 0})
                </button>
            </div>

            {/* Inventory Table */}
            {tab === 'inventory' && (
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Medicine Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Manufacturer</th>
                                    <th className="p-4">Unit Price</th>
                                    <th className="p-4">Current Stock</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <span>Loading stock...</span>
                                        </td>
                                    </tr>
                                ) : data.inventory?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                                            No medicines in inventory.
                                        </td>
                                    </tr>
                                ) : (
                                    data.inventory?.map((med) => (
                                        <tr key={med.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 font-bold text-on-surface">{med.name}</td>
                                            <td className="p-4 text-on-surface-variant">{med.category}</td>
                                            <td className="p-4 text-on-surface-variant">{med.manufacturer || 'General'}</td>
                                            <td className="p-4 font-bold text-on-surface">₹{med.unitPrice.toFixed(2)}</td>
                                            <td className="p-4 font-black text-sm text-on-surface">{med.totalStock} Units</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    med.isLowStock ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {med.isLowStock ? 'LOW STOCK ALERT' : 'IN STOCK'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Prescriptions Table */}
            {tab === 'prescriptions' && (
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4">Medicines</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                {data.prescriptions?.map((presc) => (
                                    <tr key={presc.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">{new Date(presc.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-on-surface">{presc.patient?.user?.name}</td>
                                        <td className="p-4 text-on-surface">Dr. {presc.doctor?.user?.name}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {presc.items?.map((it, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-surface-container rounded text-[10px] font-bold">
                                                        {it.medicineName} ({it.quantity})
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                presc.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {presc.dispensed ? 'DISPENSED' : 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPharmacyManagement;
