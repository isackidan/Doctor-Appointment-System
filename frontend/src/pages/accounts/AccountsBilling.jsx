import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsBilling = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Payment Modal State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [referenceNo, setReferenceNo] = useState('');
    const [processing, setProcessing] = useState(false);

    // Bill View Modal State
    const [viewingBill, setViewingBill] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/accounts/invoices', { params });
            setInvoices(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load patient invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchInvoices();
    };

    const openPayModal = (inv) => {
        setSelectedInvoice(inv);
        setPayAmount(inv.pendingAmount > 0 ? inv.pendingAmount.toString() : inv.totalAmount.toString());
        setPaymentMethod('CASH');
        setReferenceNo(`TXN-${Date.now().toString().slice(-6)}`);
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setProcessing(true);
            await api.post(`/accounts/invoices/${selectedInvoice.id}/pay`, {
                amount,
                paymentMethod,
                referenceNo
            });
            toast.success(`Payment of ₹${amount.toFixed(2)} recorded successfully!`);
            setSelectedInvoice(null);
            fetchInvoices();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Payment recording failed');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintBill = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Patient Billing & Invoices</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Manage patient bills, dues tracking, and payment collection.</p>
                </div>
                <button
                    onClick={fetchInvoices}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                    title="Refresh list"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                        { id: 'ALL', label: 'All Bills' },
                        { id: 'PENDING', label: 'Pending' },
                        { id: 'PARTIAL', label: 'Partially Paid' },
                        { id: 'PAID', label: 'Paid' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-on-surface-variant hover:bg-surface-container'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search patient or Bill #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Table of Invoices */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Bill Date</th>
                                <th className="p-4">Bill No</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Doctor / Service</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Pending</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading billing records...</span>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-10 text-center text-on-surface-variant">
                                        No billing invoices found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => {
                                    const billNo = `INV-${inv.id.slice(0, 8).toUpperCase()}`;
                                    const isPaid = inv.paymentStatus === 'PAID' || inv.pendingAmount <= 0;
                                    const isPartial = inv.paymentStatus === 'PARTIAL' || (inv.paidAmount > 0 && inv.pendingAmount > 0);

                                    return (
                                        <tr key={inv.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 text-on-surface">
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                                <div className="text-[10px] text-on-surface-variant">{new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-indigo-600">
                                                {billNo}
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">
                                                {inv.patient?.user?.name}
                                                <div className="text-[10px] font-normal text-on-surface-variant">ID: {inv.patient?.patientCode}</div>
                                            </td>
                                            <td className="p-4 text-on-surface">
                                                Dr. {inv.appointment?.doctor?.user?.name || 'General Consultation'}
                                                {inv.appointment?.department && (
                                                    <div className="text-[10px] text-on-surface-variant">{inv.appointment.department.name}</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-bold text-on-surface text-sm">
                                                ₹{inv.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold text-emerald-600">
                                                ₹{inv.paidAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold text-rose-600">
                                                ₹{inv.pendingAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                    isPartial ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                    'bg-rose-100 text-rose-800 border-rose-200'
                                                }`}>
                                                    {isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                {!isPaid && (
                                                    <button
                                                        onClick={() => openPayModal(inv)}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm inline-flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">payments</span>
                                                        Pay
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setViewingBill(inv)}
                                                    className="px-3 py-1.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-lg text-xs font-bold hover:bg-surface-container-high transition shadow-sm inline-flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                    Bill
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Collect Payment Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-lg font-bold text-on-surface">Record Patient Payment</h3>
                            <button onClick={() => setSelectedInvoice(null)} className="text-on-surface-variant hover:text-rose-600 transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Bill Details Preview */}
                        <div className="bg-surface-container rounded-xl p-3.5 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Patient Name:</span>
                                <span className="font-bold text-on-surface">{selectedInvoice.patient?.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Invoice Reference:</span>
                                <span className="font-mono font-bold text-indigo-600">#INV-{selectedInvoice.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Total Billed:</span>
                                <span className="font-bold text-on-surface">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-bold border-t border-outline-variant/20 pt-1">
                                <span>Outstanding Due:</span>
                                <span>₹{selectedInvoice.pendingAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1 text-on-surface">Payment Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max={selectedInvoice.pendingAmount}
                                    required
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600"
                                />
                                <span className="text-[10px] text-on-surface-variant">You can enter full or partial payment amount.</span>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1 text-on-surface">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Credit / Debit Card</option>
                                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                    <option value="ONLINE">Online Bank Transfer</option>
                                    <option value="INSURANCE">Insurance Claim</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1 text-on-surface">Transaction / Ref Number</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    placeholder="e.g. UPI-123456 or Receipt #"
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-mono"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedInvoice(null)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Recording...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View & Print Bill Modal */}
            {viewingBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
                    <div className="bg-surface rounded-2xl max-w-xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden print:shadow-none print:border-none print:w-full">
                        {/* Modal Header */}
                        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between print:hidden">
                            <h3 className="text-base font-bold text-on-surface">Patient Bill & Invoice Preview</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintBill}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 transition"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span> Print
                                </button>
                                <button
                                    onClick={() => setViewingBill(null)}
                                    className="p-1 text-on-surface-variant hover:text-rose-600 transition"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Printable Area */}
                        <div className="p-8 space-y-6 text-on-surface">
                            <div className="text-center border-b border-outline-variant/30 pb-4">
                                <h2 className="text-2xl font-black text-indigo-700">Lumina Health & Research Hospital</h2>
                                <p className="text-xs text-on-surface-variant">Official Patient Billing Statement</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-on-surface-variant">Bill To:</p>
                                    <p className="font-bold text-sm text-on-surface">{viewingBill.patient?.user?.name}</p>
                                    <p className="text-on-surface-variant">Patient ID: {viewingBill.patient?.patientCode}</p>
                                    {viewingBill.patient?.user?.phone && <p className="text-on-surface-variant">Phone: {viewingBill.patient?.user?.phone}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant">Invoice No:</p>
                                    <p className="font-mono font-bold text-sm text-indigo-600">INV-{viewingBill.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-on-surface-variant">Date: {new Date(viewingBill.createdAt).toLocaleDateString()}</p>
                                    <p className="text-on-surface-variant">Doctor: Dr. {viewingBill.appointment?.doctor?.user?.name || 'General'}</p>
                                </div>
                            </div>

                            <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-surface-container-lowest border-b border-outline-variant/20 font-bold">
                                        <tr>
                                            <th className="p-3">Description</th>
                                            <th className="p-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        <tr>
                                            <td className="p-3 font-semibold">Doctor Consultation Fee</td>
                                            <td className="p-3 text-right font-bold">₹{(viewingBill.appointment?.doctorFee || viewingBill.subTotal || 500).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-semibold">Hospital Service & Administration</td>
                                            <td className="p-3 text-right font-bold">₹{(viewingBill.appointment?.adminCommission || 50).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-surface-container font-bold border-t border-outline-variant/20">
                                        <tr>
                                            <td className="p-3">Total Amount</td>
                                            <td className="p-3 text-right text-sm font-black text-indigo-700">₹{viewingBill.totalAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 text-emerald-700">Total Paid</td>
                                            <td className="p-3 text-right text-emerald-700">₹{viewingBill.paidAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 text-rose-700">Pending Balance</td>
                                            <td className="p-3 text-right text-rose-700">₹{viewingBill.pendingAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Payments History on the bill */}
                            {viewingBill.payments?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Payment Transactions</h4>
                                    <div className="space-y-1">
                                        {viewingBill.payments.map((p) => (
                                            <div key={p.id} className="flex justify-between text-xs bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
                                                <span>{new Date(p.paidAt).toLocaleDateString()} • {p.paymentMethod} ({p.referenceNo || 'N/A'})</span>
                                                <span className="font-bold text-emerald-600">₹{p.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-end text-xs">
                                <div>
                                    <p className="text-[10px] text-on-surface-variant">Thank you for choosing Lumina Health.</p>
                                    <p className="text-[10px] text-on-surface-variant">This is a system generated receipt.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-32 border-b border-outline-variant/40 mb-1"></div>
                                    <p className="text-[10px] font-bold text-on-surface">Accounts Officer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsBilling;
