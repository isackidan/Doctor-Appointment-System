import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PharmacyInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal States
    const [showAddMedModal, setShowAddMedModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null);

    // Add Medicine Form State
    const [medForm, setMedForm] = useState({ name: '', category: 'General Medicine', unitPrice: '45.0', reorderLevel: '10' });
    // Add Stock Batch Form State
    const [stockForm, setStockForm] = useState({ batchNumber: `BAT-${Date.now().toString().slice(-4)}`, quantity: '100', expiryDate: '2028-12-31' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pharmacy/inventory');
            setInventory(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load medicine inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/medicines', medForm);
            toast.success('New medicine added to catalog!');
            setShowAddMedModal(false);
            setMedForm({ name: '', category: 'General Medicine', unitPrice: '45.0', reorderLevel: '10' });
            fetchInventory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add medicine');
        }
    };

    const handleAddStockBatch = async (e) => {
        e.preventDefault();
        if (!selectedMed) return;
        try {
            await api.post(`/pharmacy/medicines/${selectedMed.id}/stocks`, stockForm);
            toast.success(`Added ${stockForm.quantity} units to batch ${stockForm.batchNumber}!`);
            setShowAddStockModal(false);
            fetchInventory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add stock batch');
        }
    };

    const filteredInventory = inventory.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Pharmacy Medicine Inventory</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Manage medicine catalog, stock levels, batches, and reorder warnings.</p>
                </div>
                <button
                    onClick={() => setShowAddMedModal(true)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add New Medicine
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search medicines by name or category (e.g. Paracetamol, Antibiotics)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border py-3 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">Medicine Stock Levels ({filteredInventory.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Medicine Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Unit Price</th>
                                <th className="p-4">Total Stock</th>
                                <th className="p-4">Reorder Level</th>
                                <th className="p-4">Stock Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {filteredInventory.map((m) => (
                                <tr key={m.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-bold text-on-surface">💊 {m.name}</td>
                                    <td className="p-4 text-xs font-semibold text-on-surface">{m.category}</td>
                                    <td className="p-4 font-mono font-bold text-emerald-800">₹{m.unitPrice}</td>
                                    <td className="p-4 font-mono font-extrabold text-on-surface">{m.totalStock} units</td>
                                    <td className="p-4 text-xs font-mono">{m.reorderLevel} units</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            m.isLowStock ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {m.isLowStock ? 'LOW STOCK ALERT' : 'IN STOCK'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => { setSelectedMed(m); setShowAddStockModal(true); }}
                                            className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200"
                                        >
                                            + Add Batch Stock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: ADD NEW MEDICINE */}
            {showAddMedModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-2xl font-bold text-on-surface">Add New Medicine</h3>
                            <button onClick={() => setShowAddMedModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleAddMedicine} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Medicine Name *</label>
                                <input type="text" required placeholder="e.g. Amoxicillin 500mg" value={medForm.name} onChange={e => setMedForm({...medForm, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Category</label>
                                <input type="text" placeholder="General / Antibiotics / Analgesic" value={medForm.category} onChange={e => setMedForm({...medForm, category: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Unit Price (₹) *</label>
                                    <input type="number" step="0.5" required value={medForm.unitPrice} onChange={e => setMedForm({...medForm, unitPrice: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Reorder Level</label>
                                    <input type="number" value={medForm.reorderLevel} onChange={e => setMedForm({...medForm, reorderLevel: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddMedModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-sm shadow-md">Add Medicine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD STOCK BATCH */}
            {showAddStockModal && selectedMed && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-on-surface">Add Stock Batch</h3>
                                <p className="text-xs font-bold text-emerald-700">{selectedMed.name}</p>
                            </div>
                            <button onClick={() => setShowAddStockModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleAddStockBatch} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Batch Number *</label>
                                <input type="text" required value={stockForm.batchNumber} onChange={e => setStockForm({...stockForm, batchNumber: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Quantity *</label>
                                    <input type="number" required value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono font-bold" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Expiry Date *</label>
                                    <input type="date" required value={stockForm.expiryDate} onChange={e => setStockForm({...stockForm, expiryDate: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddStockModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-sm shadow-md">Add Batch Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyInventory;
