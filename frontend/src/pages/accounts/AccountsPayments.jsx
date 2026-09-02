import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [methodFilter, setMethodFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Quick Payment Modal State
    const [showQuickPay, setShowQuickPay] = useState(false);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [referenceNo, setReferenceNo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Receipt Modal State
    const [viewReceipt, setViewReceipt] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, [methodFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (methodFilter !== 'ALL') params.method = methodFilter;
            if (searchQuery) params.search = searchQuery;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get('/accounts/payments', { params });
            setPayments(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load payment records');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchPayments();
    };

    const openQuickPaymentModal = async () => {
        try {
            setShowQuickPay(true);
            const res = await api.get('/accounts/invoices?status=PENDING');
            const resPartial = await api.get('/accounts/invoices?status=PARTIAL');
            const combined = [...res.data.data, ...resPartial.data.data];
            setPendingInvoices(combined);
            if (combined.length > 0) {
                setSelectedInvoiceId(combined[0].id);
                setAmount(combined[0].pendingAmount?.toString() || combined[0].totalAmount?.toString());
            }
            setReferenceNo(`TXN-${Date.now().toString().slice(-6)}`);
        } catch (err) {
            toast.error('Failed to fetch pending invoices for payment');
        }
    };

    const handleInvoiceChange = (id) => {
        setSelectedInvoiceId(id);
        const inv = pendingInvoices.find(i => i.id === id);
        if (inv) {
            setAmount(inv.pendingAmount?.toString() || inv.totalAmount?.toString());
        }
    };

    const handleRecordQuickPay = async (e) => {
        e.preventDefault();
        if (!selectedInvoiceId) {
            toast.error('Please select an invoice');
            return;
        }

        const payVal = parseFloat(amount);
        if (isNaN(payVal) || payVal <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/accounts/invoices/${selectedInvoiceId}/pay`, {
                amount: payVal,
                paymentMethod: method,
                referenceNo
            });
            toast.success('Payment recorded successfully!');
            setShowQuickPay(false);
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment processing failed');
        } finally {
            setSubmitting(false);
        }
    };

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Payments Ledger & Receipts</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Track all hospital collections, payment methods, and transaction receipts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={openQuickPaymentModal}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_card</span>
                        Record Payment
                    </button>
                    <button
                        onClick={fetchPayments}
                        className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Summary Bar & Filters */}
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant">Method:</span>
                        <div className="flex gap-1 overflow-x-auto">
                            {['ALL', 'CASH', 'CARD', 'UPI', 'ONLINE', 'INSURANCE'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMethodFilter(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        methodFilter === m
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-on-surface-variant">Filtered Total: </span>
                        <span className="text-lg font-black text-emerald-600">₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Search and Date Range */}
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by Txn Ref #, Patient Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                            placeholder="Start Date"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                            placeholder="End Date"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Payments Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Payment Date</th>
                                <th className="p-4">Receipt / Txn Ref</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Invoice Ref</th>
                                <th className="p-4">Method</th>
                                <th className="p-4 text-right">Amount Paid</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading payment transactions...</span>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        No payment transactions found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">
                                            {new Date(p.paidAt).toLocaleDateString()}
                                            <div className="text-[10px] text-on-surface-variant">{new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-indigo-600">
                                            {p.referenceNo || `TXN-${p.id.slice(0, 6).toUpperCase()}`}
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">
                                            {p.invoice?.patient?.user?.name || 'Walk-in Patient'}
                                            <div className="text-[10px] font-normal text-on-surface-variant">ID: {p.invoice?.patient?.patientCode}</div>
                                        </td>
                                        <td className="p-4 font-mono text-on-surface-variant">
                                            #INV-{p.invoiceId?.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container border border-outline-variant/30 text-on-surface">
                                                {p.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black text-emerald-600 text-sm">
                                            ₹{p.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setViewReceipt(p)}
                                                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">receipt</span>
                                                Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Record Payment Modal */}
            {showQuickPay && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-lg font-bold text-on-surface">Record New Payment</h3>
                            <button onClick={() => setShowQuickPay(false)} className="text-on-surface-variant hover:text-rose-600 transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRecordQuickPay} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Select Outstanding Invoice</label>
                                {pendingInvoices.length === 0 ? (
                                    <p className="text-rose-600 italic">No pending or partial invoices found.</p>
                                ) : (
                                    <select
                                        value={selectedInvoiceId}
                                        onChange={(e) => handleInvoiceChange(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                                    >
                                        {pendingInvoices.map((inv) => (
                                            <option key={inv.id} value={inv.id}>
                                                {inv.patient?.user?.name} (INV-{inv.id.slice(0, 6).toUpperCase()}) - Due: ₹{inv.pendingAmount?.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Payment Method</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Credit/Debit Card</option>
                                    <option value="UPI">UPI / GPay / PhonePe</option>
                                    <option value="ONLINE">Online Banking</option>
                                    <option value="INSURANCE">Insurance</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Transaction / Ref Number</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    placeholder="e.g. UPI-998822"
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-mono"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickPay(false)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || pendingInvoices.length === 0}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Recording...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {viewReceipt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
                    <div className="bg-surface rounded-2xl max-w-md w-full border border-outline-variant/30 shadow-2xl p-6 space-y-4 print:shadow-none print:border-none print:w-full">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 print:hidden">
                            <h3 className="text-base font-bold text-on-surface">Payment Receipt</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span> Print
                                </button>
                                <button onClick={() => setViewReceipt(null)} className="text-on-surface-variant hover:text-rose-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Receipt Content */}
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-black text-indigo-700">Lumina Health Hospital</h2>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Official Payment Receipt</p>
                        </div>

                        <div className="bg-surface-container rounded-xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Receipt No:</span>
                                <span className="font-mono font-bold text-on-surface">{viewReceipt.referenceNo || `TXN-${viewReceipt.id.slice(0, 6).toUpperCase()}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Date & Time:</span>
                                <span className="text-on-surface">{new Date(viewReceipt.paidAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Patient:</span>
                                <span className="font-bold text-on-surface">{viewReceipt.invoice?.patient?.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Invoice Ref:</span>
                                <span className="font-mono text-on-surface">INV-{viewReceipt.invoiceId?.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Payment Method:</span>
                                <span className="font-bold text-on-surface">{viewReceipt.paymentMethod}</span>
                            </div>
                            <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center text-sm">
                                <span className="font-bold text-on-surface">Amount Paid:</span>
                                <span className="font-black text-emerald-600 text-lg">₹{viewReceipt.amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center pt-2 text-[10px] text-on-surface-variant">
                            Thank you! Payment received with thanks.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPayments;
