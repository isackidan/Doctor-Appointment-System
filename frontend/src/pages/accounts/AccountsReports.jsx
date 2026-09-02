import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsReports = () => {
    const [reportType, setReportType] = useState('daily_collection');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const reportTabs = [
        { id: 'daily_collection', label: 'Daily Collections', icon: 'payments' },
        { id: 'payment_report', label: 'Payment Ledger', icon: 'receipt_long' },
        { id: 'pending_dues', label: 'Pending Dues Report', icon: 'pending_actions' },
        { id: 'expense_report', label: 'Expenses Report', icon: 'trending_down' }
    ];

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get(`/accounts/reports/${reportType}`, { params });
            setReportData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto print:p-0 print:space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Financial Reports & Statements</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Generate daily collections, dues summaries, and expense analysis.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print Report
                    </button>
                    <button
                        onClick={fetchReport}
                        className="p-2 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-wrap gap-2 print:hidden">
                {reportTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setReportType(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            reportType === tab.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filter by Date Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm print:hidden">
                <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant">Date Range:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                        Generate Statement
                    </button>
                </form>
            </div>

            {/* Printable Report Canvas */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Hospital Header for Print */}
                <div className="text-center border-b border-outline-variant/30 pb-4">
                    <h2 className="text-2xl font-black text-indigo-700">Lumina Health & Research Hospital</h2>
                    <h3 className="text-sm font-bold text-on-surface mt-1 uppercase tracking-wider">
                        {reportTabs.find(t => t.id === reportType)?.label || 'Financial Report'}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-on-surface-variant">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Calculating report data...</span>
                    </div>
                ) : !reportData ? (
                    <div className="p-12 text-center text-xs text-on-surface-variant">No report data generated.</div>
                ) : (
                    <>
                        {/* 1. Daily Collection Report View */}
                        {reportType === 'daily_collection' && (
                            <div className="space-y-6">
                                {/* Totals by Payment Method */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {Object.entries(reportData.methodTotals || {}).map(([m, val]) => (
                                        <div key={m} className="p-3 bg-surface-container rounded-xl border border-outline-variant/20 text-center">
                                            <p className="text-[10px] uppercase font-bold text-on-surface-variant">{m}</p>
                                            <p className="text-sm font-black text-on-surface mt-0.5">₹{val.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-950 font-bold">
                                    <span>Total Collections ({reportData.count || 0} Transactions)</span>
                                    <span className="text-xl font-extrabold text-emerald-700">₹{(reportData.grandTotal || 0).toFixed(2)}</span>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                                            <tr>
                                                <th className="p-3">Time</th>
                                                <th className="p-3">Patient</th>
                                                <th className="p-3">Ref No</th>
                                                <th className="p-3">Method</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/10">
                                            {reportData.payments?.map(p => (
                                                <tr key={p.id}>
                                                    <td className="p-3">{new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="p-3 font-bold">{p.invoice?.patient?.user?.name || 'Walk-in'}</td>
                                                    <td className="p-3 font-mono">{p.referenceNo || 'N/A'}</td>
                                                    <td className="p-3">{p.paymentMethod}</td>
                                                    <td className="p-3 text-right font-black text-emerald-600">₹{p.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 2. Pending Dues Report */}
                        {reportType === 'pending_dues' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-950 font-bold">
                                    <span>Total Outstanding Patient Receivables ({reportData.count || 0} Invoices)</span>
                                    <span className="text-xl font-extrabold text-rose-600">₹{(reportData.totalOutstanding || 0).toFixed(2)}</span>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Bill No</th>
                                                <th className="p-3">Patient Name</th>
                                                <th className="p-3">Total Amount</th>
                                                <th className="p-3">Paid</th>
                                                <th className="p-3 text-right">Outstanding Due</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/10">
                                            {reportData.invoices?.map(inv => (
                                                <tr key={inv.id}>
                                                    <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-3 font-mono text-indigo-600">#INV-{inv.id.slice(0, 6).toUpperCase()}</td>
                                                    <td className="p-3 font-bold">{inv.patient?.user?.name} (ID: {inv.patient?.patientCode})</td>
                                                    <td className="p-3 font-bold">₹{inv.totalAmount.toFixed(2)}</td>
                                                    <td className="p-3 font-bold text-emerald-600">₹{inv.paidAmount.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-black text-rose-600">₹{inv.pendingAmount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Expense Report */}
                        {reportType === 'expense_report' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center text-rose-950 font-bold">
                                    <span>Total Operational Expenses ({reportData.count || 0} Records)</span>
                                    <span className="text-xl font-extrabold text-rose-700">₹{(reportData.grandTotal || 0).toFixed(2)}</span>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Description</th>
                                                <th className="p-3">Recorded By</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/10">
                                            {reportData.expenses?.map(exp => (
                                                <tr key={exp.id}>
                                                    <td className="p-3">{new Date(exp.date).toLocaleDateString()}</td>
                                                    <td className="p-3 font-bold text-rose-700">{exp.category}</td>
                                                    <td className="p-3">{exp.description || 'N/A'}</td>
                                                    <td className="p-3 text-on-surface-variant">{exp.recordedBy || 'Accounts'}</td>
                                                    <td className="p-3 text-right font-black text-rose-600">₹{exp.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 4. Payment Ledger Report */}
                        {reportType === 'payment_report' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex justify-between items-center text-indigo-950 font-bold">
                                    <span>Total Payments Ledger ({reportData.count || 0} Receipts)</span>
                                    <span className="text-xl font-extrabold text-indigo-700">₹{(reportData.totalAmount || 0).toFixed(2)}</span>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Receipt / Txn Ref</th>
                                                <th className="p-3">Patient</th>
                                                <th className="p-3">Method</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/10">
                                            {reportData.payments?.map(p => (
                                                <tr key={p.id}>
                                                    <td className="p-3">{new Date(p.paidAt).toLocaleDateString()}</td>
                                                    <td className="p-3 font-mono font-bold text-indigo-600">{p.referenceNo || 'N/A'}</td>
                                                    <td className="p-3 font-bold">{p.invoice?.patient?.user?.name || 'Walk-in'}</td>
                                                    <td className="p-3">{p.paymentMethod}</td>
                                                    <td className="p-3 text-right font-black text-emerald-600">₹{p.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Signatures */}
                <div className="pt-8 border-t border-outline-variant/30 flex justify-between items-end text-xs">
                    <div>
                        <p className="text-[10px] text-on-surface-variant">Confidential Financial Report • Lumina Hospital ERP</p>
                    </div>
                    <div className="text-center">
                        <div className="w-40 border-b border-outline-variant/40 mb-1"></div>
                        <p className="text-[10px] font-bold text-on-surface">Chief Financial Officer / Accounts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsReports;
