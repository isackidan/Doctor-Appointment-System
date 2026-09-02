import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsPatientSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Collect Payment Modal
    const [payingInvoice, setPayingInvoice] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [referenceNo, setReferenceNo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            setLoading(true);
            const res = await api.get(`/accounts/patient-search?query=${encodeURIComponent(query)}`);
            setResults(res.data.data);
            setHasSearched(true);
            if (res.data.data.length > 0) {
                setSelectedLedger(res.data.data[0]);
            } else {
                setSelectedLedger(null);
            }
        } catch (err) {
            console.error(err);
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const openPayModal = (inv) => {
        setPayingInvoice(inv);
        setPayAmount(inv.pendingAmount > 0 ? inv.pendingAmount.toString() : inv.totalAmount.toString());
        setPaymentMethod('CASH');
        setReferenceNo(`TXN-${Date.now().toString().slice(-6)}`);
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!payingInvoice) return;

        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/accounts/invoices/${payingInvoice.id}/pay`, {
                amount,
                paymentMethod,
                referenceNo
            });
            toast.success('Payment recorded successfully!');
            setPayingInvoice(null);
            // Refresh current patient ledger
            const res = await api.get(`/accounts/patient-search?query=${encodeURIComponent(query)}`);
            setResults(res.data.data);
            const updated = res.data.data.find(r => r.patient?.id === selectedLedger.patient?.id);
            if (updated) setSelectedLedger(updated);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment recording failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-on-surface">Patient Financial Ledger Lookup</h1>
                <p className="text-xs text-on-surface-variant mt-0.5">Search patient by name or ID to view their complete billing, dues, and payment history.</p>
            </div>

            {/* Search Input Bar */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-on-surface-variant text-[20px]">
                            person_search
                        </span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter Patient Name, Patient ID (e.g. PAT-1001), or Phone number..."
                            className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Search Ledger'}
                    </button>
                </form>
            </div>

            {/* Main Content: Left Column (Results) + Right Column (Detailed Financial Ledger) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Search Results List */}
                <div className="lg:col-span-1 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden h-[580px] flex flex-col">
                    <div className="p-4 border-b border-outline-variant/20 bg-surface-container-lowest">
                        <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">Matching Patients ({results.length})</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : hasSearched && results.length === 0 ? (
                            <div className="text-center p-8 text-xs text-on-surface-variant">
                                No patients found matching "{query}".
                            </div>
                        ) : !hasSearched ? (
                            <div className="text-center p-8 text-xs text-on-surface-variant flex flex-col items-center opacity-60">
                                <span className="material-symbols-outlined text-[48px] mb-2">manage_search</span>
                                Search for a patient to inspect their billing history.
                            </div>
                        ) : (
                            results.map((item) => (
                                <button
                                    key={item.patient?.id}
                                    onClick={() => setSelectedLedger(item)}
                                    className={`w-full text-left p-3.5 rounded-xl transition border ${
                                        selectedLedger?.patient?.id === item.patient?.id
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm'
                                            : 'hover:bg-surface-container border-transparent text-on-surface'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-xs">{item.patient?.user?.name}</p>
                                            <p className="text-[10px] text-on-surface-variant">ID: {item.patient?.patientCode}</p>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            item.totalOutstanding > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {item.totalOutstanding > 0 ? `Due: ₹${item.totalOutstanding.toFixed(2)}` : 'Clear'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] mt-2 pt-2 border-t border-outline-variant/10 text-on-surface-variant">
                                        <span>Billed: ₹{item.totalBilled.toFixed(2)}</span>
                                        <span>Paid: ₹{item.totalPaid.toFixed(2)}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Detailed Ledger of Selected Patient */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden h-[580px] flex flex-col">
                    {selectedLedger ? (
                        <>
                            {/* Patient Summary Header */}
                            <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-on-surface">{selectedLedger.patient?.user?.name}</h2>
                                        <p className="text-xs text-on-surface-variant">
                                            Patient Code: <span className="font-bold font-mono text-indigo-600">{selectedLedger.patient?.patientCode}</span> • Phone: {selectedLedger.patient?.user?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                                            <p className="text-[9px] uppercase font-bold text-indigo-700">Total Billed</p>
                                            <p className="text-xs font-black text-indigo-900">₹{selectedLedger.totalBilled.toFixed(2)}</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                            <p className="text-[9px] uppercase font-bold text-emerald-700">Total Paid</p>
                                            <p className="text-xs font-black text-emerald-900">₹{selectedLedger.totalPaid.toFixed(2)}</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-center">
                                            <p className="text-[9px] uppercase font-bold text-rose-700">Balance Due</p>
                                            <p className="text-xs font-black text-rose-900">₹{selectedLedger.totalOutstanding.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bills and Invoices List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedLedger.bills?.length === 0 ? (
                                    <div className="text-center p-12 text-xs text-on-surface-variant">
                                        No billing invoices generated for this patient.
                                    </div>
                                ) : (
                                    selectedLedger.bills?.map((bill) => {
                                        const isPaid = bill.paymentStatus === 'PAID' || bill.pendingAmount <= 0;
                                        return (
                                            <div key={bill.id} className="p-4 rounded-xl border border-outline-variant/30 bg-surface hover:border-indigo-300 transition space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-mono text-xs font-bold text-indigo-600">#INV-{bill.id.slice(0, 8).toUpperCase()}</span>
                                                        <p className="text-[11px] text-on-surface-variant">
                                                            {new Date(bill.createdAt).toLocaleDateString()} • Dr. {bill.appointment?.doctor?.user?.name || 'General Consultation'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                            isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                            bill.paidAmount > 0 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                            'bg-rose-100 text-rose-800 border-rose-200'
                                                        }`}>
                                                            {isPaid ? 'Paid' : bill.paidAmount > 0 ? 'Partially Paid' : 'Pending'}
                                                        </span>
                                                        {!isPaid && (
                                                            <button
                                                                onClick={() => openPayModal(bill)}
                                                                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                                                            >
                                                                Pay Due
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 bg-surface-container rounded-lg p-2.5 text-xs">
                                                    <div>
                                                        <span className="text-[10px] text-on-surface-variant block">Bill Amount</span>
                                                        <span className="font-bold text-on-surface">₹{bill.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-on-surface-variant block">Amount Paid</span>
                                                        <span className="font-bold text-emerald-600">₹{bill.paidAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-on-surface-variant block">Outstanding</span>
                                                        <span className="font-bold text-rose-600">₹{bill.pendingAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                {/* Payment Receipts for this bill */}
                                                {bill.payments?.length > 0 && (
                                                    <div className="space-y-1 pt-1 border-t border-outline-variant/10 text-[11px]">
                                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Payment Receipts:</p>
                                                        {bill.payments.map((p) => (
                                                            <div key={p.id} className="flex justify-between text-on-surface bg-surface-container-lowest px-2 py-1 rounded">
                                                                <span>{new Date(p.paidAt).toLocaleDateString()} • {p.paymentMethod} (Ref: {p.referenceNo || 'N/A'})</span>
                                                                <span className="font-bold text-emerald-600">₹{p.amount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-on-surface-variant opacity-60">
                            <span className="material-symbols-outlined text-[64px] mb-2">account_balance_wallet</span>
                            <p className="font-bold text-sm">Select a Patient</p>
                            <p className="text-xs">Click on any patient from the search results to inspect their ledger.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collect Payment Modal */}
            {payingInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-lg font-bold text-on-surface">Pay Invoice: #INV-{payingInvoice.id.slice(0, 8).toUpperCase()}</h3>
                            <button onClick={() => setPayingInvoice(null)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                            <div className="bg-surface-container p-3 rounded-xl flex justify-between items-center">
                                <span className="text-on-surface-variant">Outstanding Balance:</span>
                                <span className="font-black text-rose-600 text-sm">₹{payingInvoice.pendingAmount.toFixed(2)}</span>
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Payment Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max={payingInvoice.pendingAmount}
                                    required
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Credit/Debit Card</option>
                                    <option value="UPI">UPI / GPay / PhonePe</option>
                                    <option value="ONLINE">Online Bank Transfer</option>
                                    <option value="INSURANCE">Insurance</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Transaction / Ref Number</label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-mono"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPayingInvoice(null)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : 'Confirm & Collect'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPatientSearch;
