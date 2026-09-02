import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [category, setCategory] = useState('Medical Supplies');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        'Medical Supplies',
        'Pharmacy Stock',
        'Hospital Utilities',
        'Equipment & Maintenance',
        'Staff Welfare',
        'Administrative',
        'Miscellaneous'
    ];

    useEffect(() => {
        fetchExpenses();
    }, [categoryFilter]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = {};
            if (categoryFilter !== 'ALL') params.category = categoryFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get('/accounts/expenses', { params });
            setExpenses(res.data.data.expenses);
            setTotalAmount(res.data.data.totalAmount);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchExpenses();
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const expVal = parseFloat(amount);
        if (isNaN(expVal) || expVal <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/accounts/expenses', {
                category,
                amount: expVal,
                date,
                description
            });
            toast.success('Expense recorded successfully!');
            setShowAddModal(false);
            setAmount('');
            setDescription('');
            fetchExpenses();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add expense');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense record?')) return;

        try {
            await api.delete(`/accounts/expenses/${id}`);
            toast.success('Expense deleted');
            fetchExpenses();
        } catch (err) {
            toast.error('Failed to delete expense');
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Hospital Expense Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Record and monitor operational hospital expenditures.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Add Expense
                    </button>
                    <button
                        onClick={fetchExpenses}
                        className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Total Expense Card & Category Filter */}
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        <button
                            onClick={() => setCategoryFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                categoryFilter === 'ALL' ? 'bg-rose-600 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategoryFilter(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                    categoryFilter === c ? 'bg-rose-600 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="text-right w-full sm:w-auto">
                        <span className="text-xs text-on-surface-variant">Total Expenditure: </span>
                        <span className="text-xl font-black text-rose-600">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Date Filter */}
                <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant font-bold">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-rose-600"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant font-bold">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-rose-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                    >
                        Apply Filter
                    </button>
                </form>
            </div>

            {/* Expenses Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Expense Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Recorded By</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading expenses...</span>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        No expense records found.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-on-surface">
                                            {exp.description || 'No description provided.'}
                                        </td>
                                        <td className="p-4 text-on-surface-variant">
                                            {exp.recordedBy || 'Accounts Staff'}
                                        </td>
                                        <td className="p-4 text-right font-black text-rose-600 text-sm">
                                            ₹{exp.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                className="p-1.5 text-on-surface-variant hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                                title="Delete record"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-lg font-bold text-on-surface">Add New Hospital Expense</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-rose-600 transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Expense Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-rose-600"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter expense amount"
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-bold focus:outline-none focus:border-rose-600"
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Expense Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-rose-600"
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Description / Remarks</label>
                                <textarea
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Purchased sanitizers and gloves batch #102..."
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-rose-600 resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsExpenses;
