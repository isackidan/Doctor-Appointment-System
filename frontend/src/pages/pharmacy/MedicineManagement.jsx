import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
    Analgesic: '🩹', Antibiotic: '💊', Cardiac: '❤️', Diabetes: '🩸',
    Gastro: '🫁', Respiratory: '🫀', Vitamins: '🌿', Neurology: '🧠',
    Dermatology: '🧴', Ophthalmology: '👁️', ENT: '👂', Gynaecology: '🌸',
    Paediatric: '👶', Oncology: '🔬', Immunology: '🛡️', Surgical: '🔧',
    Emergency: '🚨', General: '📦'
};

// ── CSV Download Template ────────────────────────────────────────────────────
const downloadTemplate = () => {
    const header = 'name,category,unit_price,reorder_level,initial_stock\n';
    const sample = [
        'Paracetamol 650mg,Analgesic,9.50,20,200',
        'Amoxicillin 250mg,Antibiotic,15.00,15,150',
        'Vitamin C 500mg,Vitamins,12.00,10,100',
    ].join('\n');
    const blob = new Blob([header + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicine_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
};

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const MedicineModal = ({ mode, medicine, categories, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: medicine?.name || '',
        category: medicine?.category || (categories[0] || 'General'),
        unitPrice: medicine?.unitPrice || '',
        reorderLevel: medicine?.reorderLevel || 10
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === 'edit') {
                await api.put(`/medicines/${medicine.id}`, form);
                toast.success('Medicine updated successfully!');
            } else {
                await api.post('/medicines', form);
                toast.success('Medicine added to catalog!');
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save medicine');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center border-b pb-4 mb-5">
                    <div>
                        <h3 className="text-xl font-bold text-on-surface">
                            {mode === 'edit' ? '✏️ Edit Medicine' : '💊 Add New Medicine'}
                        </h3>
                        <p className="text-xs text-on-surface-variant">Fill in medicine details below</p>
                    </div>
                    <button onClick={onClose} className="text-outline hover:text-on-surface p-1 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold block mb-1.5 text-on-surface">Medicine Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text" required
                            placeholder="e.g. Paracetamol 500mg"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full border-2 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none font-semibold"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1.5 text-on-surface">Category <span className="text-rose-500">*</span></label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full border-2 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none bg-white font-semibold"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{CATEGORY_ICONS[c] || '📦'} {c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1.5 text-on-surface">Unit Price (₹) <span className="text-rose-500">*</span></label>
                            <input
                                type="number" step="0.50" min="0.5" required
                                placeholder="e.g. 45.00"
                                value={form.unitPrice}
                                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                                className="w-full border-2 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none font-mono font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1.5 text-on-surface">Reorder Level</label>
                            <input
                                type="number" min="1"
                                value={form.reorderLevel}
                                onChange={e => setForm({ ...form, reorderLevel: parseInt(e.target.value) })}
                                className="w-full border-2 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 border-2 border-outline-variant/50 p-3 rounded-xl text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-colors">
                            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── CSV Import Modal ───────────────────────────────────────────────────────────
const ImportModal = ({ onClose, onImported }) => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.endsWith('.csv')) {
            toast.error('Only .csv files are supported');
            return;
        }
        setFile(f);
        setResult(null);
    };

    const handleImport = async () => {
        if (!file) { toast.error('Select a CSV file first'); return; }
        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/medicines/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data.data);
            toast.success(res.data.message);
            onImported();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-on-surface">📁 Bulk Import Medicines via CSV</h3>
                        <p className="text-xs text-on-surface-variant">Upload a .csv file to import multiple medicines at once.</p>
                    </div>
                    <button onClick={onClose} className="text-outline hover:text-on-surface p-1 rounded-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-1">
                    <p className="font-bold text-blue-900">📋 CSV Format Required:</p>
                    <code className="block text-[10px] bg-blue-100 p-2 rounded-lg font-mono text-blue-800">
                        name, category, unit_price, reorder_level, initial_stock
                    </code>
                    <button onClick={downloadTemplate} className="mt-2 text-blue-700 font-bold underline text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">download</span> Download Sample Template CSV
                    </button>
                </div>

                {/* Drag & Drop Upload Zone */}
                <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-outline-variant/50 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
                >
                    <span className="material-symbols-outlined text-[48px] text-emerald-400 block mb-2">upload_file</span>
                    {file ? (
                        <div>
                            <p className="font-bold text-emerald-700 text-sm">📄 {file.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{(file.size / 1024).toFixed(1)} KB — Ready to import</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold text-on-surface text-sm">Drag & drop your CSV file here</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">or click to browse</p>
                        </div>
                    )}
                    <input ref={fileRef} type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                </div>

                {/* Import Result */}
                {result && (
                    <div className={`rounded-2xl p-4 text-xs space-y-1 border ${result.errors?.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex gap-4 font-bold">
                            <span className="text-emerald-700">✅ Added: {result.added}</span>
                            <span className="text-amber-700">⏭️ Skipped (existing): {result.skipped}</span>
                        </div>
                        {result.errors?.length > 0 && (
                            <div className="mt-1 text-rose-700 space-y-0.5">
                                {result.errors.slice(0, 5).map((e, i) => <p key={i}>⚠️ {e}</p>)}
                                {result.errors.length > 5 && <p>...and {result.errors.length - 5} more</p>}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="flex-1 border-2 border-outline-variant/50 p-3 rounded-xl text-sm font-semibold hover:bg-surface-container-low">
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button onClick={handleImport} disabled={importing || !file}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                            {importing ? (
                                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Importing...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">upload</span> Import Medicines</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const MedicineManagement = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        api.get('/medicines/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [search, activeCategory, currentPage]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(search ? { search } : {}),
                ...(activeCategory !== 'All' ? { category: activeCategory } : {}),
                page: currentPage,
                limit: 25
            });
            const res = await api.get(`/medicines?${params.toString()}`);
            setMedicines(res.data.medicines || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (med) => {
        if (!window.confirm(`Delete "${med.name}" from catalog?`)) return;
        setDeleting(med.id);
        try {
            await api.delete(`/medicines/${med.id}`);
            toast.success(`"${med.name}" deleted`);
            fetchMedicines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally {
            setDeleting(null);
        }
    };

    const allCategories = ['All', ...categories];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
                        <span className="material-symbols-outlined text-[16px]">medication</span>
                        Medicine Catalog Management
                    </div>
                    <h1 className="font-display text-3xl font-bold">Medicines & Drug Catalog</h1>
                    <p className="text-emerald-200 text-sm mt-1">{total} medicines in catalog • Add manually or bulk import via CSV file.</p>
                </div>
                <div className="relative z-10 flex gap-2 flex-wrap">
                    <button onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span> Import CSV
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 bg-white text-emerald-900 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-50 transition-all">
                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Medicine
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search medicines by name... (e.g. Paracetamol, Amlodipine, Metformin)"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full border-2 py-3 pl-11 pr-4 rounded-xl text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                </div>
                {/* Category Pill Filters */}
                <div className="flex flex-wrap gap-2">
                    {allCategories.map(c => (
                        <button key={c} onClick={() => { setActiveCategory(c); setCurrentPage(1); }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === c
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-emerald-100 hover:text-emerald-900'}`}>
                            {c !== 'All' && <span>{CATEGORY_ICONS[c] || '📦'}</span>}
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Medicine Table */}
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold text-on-surface">
                        {loading ? 'Loading...' : `${total} Medicine${total !== 1 ? 's' : ''} Found`}
                        {activeCategory !== 'All' && <span className="ml-2 text-emerald-600">in {activeCategory}</span>}
                    </h3>
                    <button onClick={downloadTemplate} className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[16px]">download</span> CSV Template
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                <th className="p-4">#</th>
                                <th className="p-4">Medicine Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Unit Price</th>
                                <th className="p-4">Available Stock</th>
                                <th className="p-4">Reorder At</th>
                                <th className="p-4">Stock Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {loading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-on-surface-variant">Loading medicines...</td></tr>
                            ) : medicines.length === 0 ? (
                                <tr><td colSpan={8} className="p-12 text-center">
                                    <span className="material-symbols-outlined text-[48px] text-emerald-200 block mb-2">medication</span>
                                    <p className="text-on-surface-variant font-bold">No medicines found</p>
                                    <button onClick={() => setShowAddModal(true)} className="mt-3 text-emerald-600 font-bold text-sm underline">Add your first medicine</button>
                                </td></tr>
                            ) : medicines.map((med, idx) => (
                                <tr key={med.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 text-xs text-on-surface-variant font-mono">
                                        {(currentPage - 1) * 25 + idx + 1}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-on-surface">{CATEGORY_ICONS[med.category] || '💊'} {med.name}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {med.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-extrabold text-emerald-700">₹{med.unitPrice}</td>
                                    <td className="p-4 font-mono font-bold">{med.totalStock} units</td>
                                    <td className="p-4 text-xs text-on-surface-variant font-mono">{med.reorderLevel} units</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${med.isLowStock
                                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                                            : 'bg-emerald-100 text-emerald-800'}`}>
                                            {med.isLowStock ? '⚠️ Low Stock' : '✅ In Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditTarget(med); setShowEditModal(true); }}
                                                className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(med)}
                                                disabled={deleting === med.id}
                                                className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                                {deleting === med.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="p-4 border-t flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Page {currentPage} of {pages} ({total} total)</span>
                        <div className="flex gap-2">
                            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg border font-bold disabled:opacity-40 hover:bg-surface-container-low">
                                ← Prev
                            </button>
                            <button disabled={currentPage >= pages} onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg border font-bold disabled:opacity-40 hover:bg-surface-container-low">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <MedicineModal
                    mode="add"
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onSave={fetchMedicines}
                />
            )}
            {showEditModal && editTarget && (
                <MedicineModal
                    mode="edit"
                    medicine={editTarget}
                    categories={categories}
                    onClose={() => { setShowEditModal(false); setEditTarget(null); }}
                    onSave={fetchMedicines}
                />
            )}
            {showImportModal && (
                <ImportModal
                    onClose={() => setShowImportModal(false)}
                    onImported={fetchMedicines}
                />
            )}
        </div>
    );
};

export default MedicineManagement;
