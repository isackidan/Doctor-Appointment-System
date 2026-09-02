import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AccountsDashboard = () => {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayPaymentsCount: 0,
        totalRevenue: 0,
        totalPaymentsCount: 0,
        pendingInvoicesCount: 0,
        totalPendingAmount: 0,
        todayExpenses: 0,
        totalExpenses: 0,
        recentPayments: [],
        recentInvoices: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/accounts/dashboard');
            setStats(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load accounts dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const cards = [
        {
            title: "Today's Revenue",
            value: `₹${(stats.todayRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            subText: `${stats.todayPaymentsCount || 0} transactions today`,
            icon: 'payments',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-200',
            iconBg: 'bg-indigo-600 text-white'
        },
        {
            title: "Today's Payments",
            value: stats.todayPaymentsCount || 0,
            subText: `Total ${stats.totalPaymentsCount || 0} receipts to date`,
            icon: 'receipt',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
            iconBg: 'bg-emerald-600 text-white'
        },
        {
            title: "Pending Dues",
            value: `₹${(stats.totalPendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            subText: `${stats.pendingInvoicesCount || 0} unpaid/partial bills`,
            icon: 'pending_actions',
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-200',
            iconBg: 'bg-amber-600 text-white'
        },
        {
            title: "Total Expenses",
            value: `₹${(stats.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            subText: `₹${(stats.todayExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} today`,
            icon: 'trending_down',
            color: 'text-rose-600',
            bg: 'bg-rose-50 border-rose-200',
            iconBg: 'bg-rose-600 text-white'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Accounts & Finance Desk</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Real-time financial overview, revenue metrics, and hospital cash flow.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/accounts/billing')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_card</span>
                        Collect Payment
                    </button>
                    <button
                        onClick={() => navigate('/accounts/expenses')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl font-bold text-sm transition shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Add Expense
                    </button>
                </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card, idx) => (
                    <div key={idx} className={`rounded-2xl p-6 border shadow-sm ${card.bg} transition-all hover:shadow-md`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">{card.title}</span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${card.iconBg}`}>
                                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                            </div>
                        </div>
                        <div className={`mt-4 text-3xl font-black ${card.color}`}>{card.value}</div>
                        <p className="text-xs font-semibold text-on-surface-variant/80 mt-1">{card.subText}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Short Cuts */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                <h2 className="text-base font-bold text-on-surface mb-4">Financial Operations</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/accounts/billing')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Patient Billing</span>
                    </button>
                    <button
                        onClick={() => navigate('/accounts/payments')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[24px]">payments</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Payment Ledger</span>
                    </button>
                    <button
                        onClick={() => navigate('/accounts/expenses')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[24px]">trending_down</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Hospital Expenses</span>
                    </button>
                    <button
                        onClick={() => navigate('/accounts/reports')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Financial Reports</span>
                    </button>
                </div>
            </div>

            {/* Two Column Grid: Recent Payments & Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
                        <div>
                            <h3 className="text-base font-bold text-on-surface">Recent Payments Received</h3>
                            <p className="text-xs text-on-surface-variant">Latest recorded collections</p>
                        </div>
                        <button
                            onClick={() => navigate('/accounts/payments')}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-outline-variant/10 flex-1 overflow-y-auto max-h-80">
                        {stats.recentPayments?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-on-surface-variant font-medium">No recent payments.</div>
                        ) : (
                            stats.recentPayments?.map((payment) => (
                                <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">{payment.invoice?.patient?.user?.name || 'Walk-in Patient'}</p>
                                            <p className="text-xs text-on-surface-variant">{payment.paymentMethod} • Ref: {payment.referenceNo || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600">+₹{payment.amount.toFixed(2)}</p>
                                        <p className="text-[11px] text-on-surface-variant">{new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
                        <div>
                            <h3 className="text-base font-bold text-on-surface">Recent Patient Invoices</h3>
                            <p className="text-xs text-on-surface-variant">Billed consultations & procedures</p>
                        </div>
                        <button
                            onClick={() => navigate('/accounts/billing')}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-outline-variant/10 flex-1 overflow-y-auto max-h-80">
                        {stats.recentInvoices?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-on-surface-variant font-medium">No recent invoices.</div>
                        ) : (
                            stats.recentInvoices?.map((inv) => (
                                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                                            <span className="material-symbols-outlined text-[18px]">receipt</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">{inv.patient?.user?.name}</p>
                                            <p className="text-xs text-on-surface-variant">ID: #{inv.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-on-surface">₹{inv.totalAmount.toFixed(2)}</p>
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                            inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                            inv.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                                            'bg-rose-100 text-rose-800'
                                        }`}>
                                            {inv.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;
