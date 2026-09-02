import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAccountsManagement = () => {
    const [data, setData] = useState({ totalRevenue: 0, totalExpenses: 0, totalPending: 0, invoices: [], payments: [], expenses: [] });
    const [tab, setTab] = useState('invoices');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/accounts');
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load accounts overview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Hospital Financial Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Centralized revenue tracking, billing invoices, expenses, and ledger.</p>
                </div>
                <button
                    onClick={fetchAccounts}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Total Revenue Collected</span>
                    <p className="text-2xl font-black text-emerald-700 mt-2">₹{(data.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">Total Hospital Expenses</span>
                    <p className="text-2xl font-black text-rose-700 mt-2">₹{(data.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Pending Patient Dues</span>
                    <p className="text-2xl font-black text-amber-700 mt-2">₹{(data.totalPending || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface-container rounded-2xl max-w-sm">
                <button
                    onClick={() => setTab('invoices')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        tab === 'invoices' ? 'bg-surface text-indigo-800 shadow-sm' : 'text-on-surface-variant'
                    }`}
                >
                    Invoices ({data.invoices?.length || 0})
                </button>
                <button
                    onClick={() => setTab('payments')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        tab === 'payments' ? 'bg-surface text-indigo-800 shadow-sm' : 'text-on-surface-variant'
                    }`}
                >
                    Receipts ({data.payments?.length || 0})
                </button>
                <button
                    onClick={() => setTab('expenses')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        tab === 'expenses' ? 'bg-surface text-indigo-800 shadow-sm' : 'text-on-surface-variant'
                    }`}
                >
                    Expenses ({data.expenses?.length || 0})
                </button>
            </div>

            {/* Invoices Table */}
            {tab === 'invoices' && (
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Bill No</th>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4">Total Amount</th>
                                    <th className="p-4">Paid</th>
                                    <th className="p-4">Pending</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                {data.invoices?.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-mono font-bold text-indigo-700">INV-{inv.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="p-4 font-bold text-on-surface">{inv.patient?.user?.name}</td>
                                        <td className="p-4 text-on-surface">Dr. {inv.appointment?.doctor?.user?.name}</td>
                                        <td className="p-4 font-bold text-on-surface">₹{inv.totalAmount.toFixed(2)}</td>
                                        <td className="p-4 font-bold text-emerald-600">₹{inv.paidAmount.toFixed(2)}</td>
                                        <td className="p-4 font-bold text-rose-600">₹{inv.pendingAmount.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                                inv.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payments Table */}
            {tab === 'payments' && (
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Paid At</th>
                                    <th className="p-4">Txn Ref #</th>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                {data.payments?.map((p) => (
                                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">{new Date(p.paidAt).toLocaleString()}</td>
                                        <td className="p-4 font-mono font-bold text-indigo-700">{p.referenceNo || 'N/A'}</td>
                                        <td className="p-4 font-bold text-on-surface">{p.invoice?.patient?.user?.name}</td>
                                        <td className="p-4">{p.paymentMethod}</td>
                                        <td className="p-4 text-right font-black text-emerald-600">₹{p.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Expenses Table */}
            {tab === 'expenses' && (
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Recorded By</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                                {data.expenses?.map((e) => (
                                    <tr key={e.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-rose-700">{e.category}</td>
                                        <td className="p-4 text-on-surface">{e.description}</td>
                                        <td className="p-4 text-on-surface-variant">{e.recordedBy}</td>
                                        <td className="p-4 text-right font-black text-rose-600">₹{e.amount.toFixed(2)}</td>
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

export default AdminAccountsManagement;
