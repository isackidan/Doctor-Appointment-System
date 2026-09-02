import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [reportType, setReportType] = useState('revenue');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const reportsList = [
        { id: 'revenue', name: 'Revenue & P&L Statement', icon: 'payments' },
        { id: 'patient', name: 'Patient Admissions Report', icon: 'personal_injury' },
        { id: 'appointment', name: 'Appointments Report', icon: 'event_available' },
        { id: 'doctor', name: 'Doctor Consultations Report', icon: 'stethoscope' },
        { id: 'lab', name: 'Laboratory Diagnostics Report', icon: 'biotech' },
        { id: 'pharmacy', name: 'Pharmacy Sales Report', icon: 'local_pharmacy' },
        { id: 'billing', name: 'Invoices & Billing Report', icon: 'receipt_long' },
        { id: 'payment', name: 'Payment Transactions Report', icon: 'account_balance_wallet' },
        { id: 'expense', name: 'Hospital Expense Report', icon: 'shopping_bag' },
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

            const res = await api.get(`/admin/reports/${reportType}`, { params });
            setReportData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Centralized Hospital Reports</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Generate analytical and compliance reports across all hospital departments.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    Print / Export Report
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm space-y-4 print:hidden">
                {/* Report Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {reportsList.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setReportType(r.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                                reportType === r.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                            {r.name}
                        </button>
                    ))}
                </div>

                {/* Date Filter */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/20 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface-variant">From Date:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface-variant">To Date:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Printable Report Paper */}
            <div className="bg-surface rounded-2xl p-8 border border-outline-variant/30 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                <div className="text-center border-b border-outline-variant/30 pb-4">
                    <h2 className="text-2xl font-black text-blue-900">Lumina Health & Research Hospital</h2>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">
                        Executive Hospital Report: {reportsList.find(r => r.id === reportType)?.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                        Generated on {new Date().toLocaleString()} {startDate && `• Period: ${startDate} to ${endDate || 'Today'}`}
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-on-surface-variant">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Generating report dataset...</span>
                    </div>
                ) : !reportData ? (
                    <p className="text-center text-xs text-on-surface-variant">Select filters and generate report.</p>
                ) : reportType === 'revenue' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                <span className="text-xs font-bold text-emerald-800 uppercase">Gross Revenue Collected</span>
                                <p className="text-2xl font-black text-emerald-700 mt-1">₹{reportData.totalRevenue?.toFixed(2)}</p>
                                <span className="text-[10px] text-emerald-600">{reportData.paymentsCount} transactions</span>
                            </div>
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl">
                                <span className="text-xs font-bold text-rose-800 uppercase">Operational Expenses</span>
                                <p className="text-2xl font-black text-rose-700 mt-1">₹{reportData.totalExpense?.toFixed(2)}</p>
                                <span className="text-[10px] text-rose-600">{reportData.expensesCount} expense records</span>
                            </div>
                            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                                <span className="text-xs font-bold text-blue-800 uppercase">Net Hospital Margin</span>
                                <p className={`text-2xl font-black mt-1 ${reportData.netProfit >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                                    ₹{reportData.netProfit?.toFixed(2)}
                                </p>
                                <span className="text-[10px] text-blue-600">Surplus / (Deficit)</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-3 text-xs font-bold text-on-surface">
                            <span>Total Records Found: {reportData.count || reportData.data?.length || 0}</span>
                            {reportData.grandTotal !== undefined && (
                                <span className="text-emerald-700 font-black text-sm">Grand Total: ₹{reportData.grandTotal?.toFixed(2)}</span>
                            )}
                        </div>
                        <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-surface-container-lowest border-b font-bold">
                                    <tr>
                                        <th className="p-3">#</th>
                                        <th className="p-3">Record Details</th>
                                        <th className="p-3">Reference / Category</th>
                                        <th className="p-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10">
                                    {reportData.data?.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="p-3 text-on-surface-variant">{idx + 1}</td>
                                            <td className="p-3 font-bold text-on-surface">
                                                {item.user?.name || item.name || item.testName || `Invoice #${item.id?.slice(0, 8)}`}
                                            </td>
                                            <td className="p-3 text-on-surface-variant">
                                                {item.category || item.specialization || item.department?.name || item.paymentMethod || 'General'}
                                            </td>
                                            <td className="p-3 text-right">
                                                {new Date(item.createdAt || item.date || item.paidAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
