import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── PRINT RECEIPT MODAL COMPONENT ───────────────────────────────────────────
const PrintBillReceiptModal = ({ sale, onClose }) => {
  if (!sale) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-[28px]">receipt</span>
            <h3 className="text-2xl font-bold text-on-surface">Official Pharmacy Receipt</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div id="print-bill-receipt" className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-3 font-mono">
          <div className="flex justify-between font-bold text-emerald-900 border-b pb-2">
            <span>Bill Ref: {sale.billRef}</span>
            <span>Date: {new Date(sale.createdAt).toLocaleDateString()}</span>
          </div>
          <div>👤 <strong>Customer:</strong> {sale.customerName}</div>
          {sale.customerPhone && sale.customerPhone !== 'N/A' && <div>📞 <strong>Phone:</strong> {sale.customerPhone}</div>}
          
          <div className="border-t pt-2 space-y-1">
            <div className="font-bold text-emerald-950">Items Dispensed:</div>
            {sale.cartItems?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>• {item.medicineName} (×{item.quantity})</span>
                <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {sale.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({sale.discount}%):</span>
              <span>-₹{sale.discountAmount?.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between font-bold text-sm text-emerald-900">
            <span>Total Amount Paid:</span>
            <span className="text-base text-emerald-700 font-extrabold">₹{sale.totalAmount?.toFixed(2)} ({sale.paymentMethod})</span>
          </div>
          {sale.changeAmount > 0 && (
            <div className="flex justify-between text-amber-800">
              <span>Change Returned:</span>
              <span>₹{sale.changeAmount?.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">print</span> Print Receipt
          </button>
          <button onClick={onClose} className="border p-3 rounded-xl text-xs font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const PharmacyDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSalesCount: 0,
        todaySalesCount: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        avgBillValue: 0,
        pendingPrescriptions: 0,
        dispensedToday: 0,
        totalMedicines: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        paymentBreakdown: { CASH: { count: 0, amount: 0 }, CARD: { count: 0, amount: 0 }, UPI: { count: 0, amount: 0 } },
        topSellingMedicines: [],
        recentSales: []
    });

    const [rxQueue, setRxQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);

    // Dispense modal
    const [showDispenseModal, setShowDispenseModal] = useState(false);
    const [selectedRx, setSelectedRx] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, queueRes] = await Promise.all([
                api.get('/pharmacy/stats'),
                api.get('/pharmacy/prescriptions')
            ]);
            if (statsRes.data.data) setStats(statsRes.data.data);
            if (queueRes.data.data) setRxQueue(queueRes.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load pharmacy dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDispenseRx = async () => {
        if (!selectedRx) return;
        try {
            const res = await api.post(`/pharmacy/dispense/${selectedRx.id}`, { paymentMethod });
            toast.success('Prescription dispensed & stock updated!');
            setShowDispenseModal(false);
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Dispensing failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-emerald-200">
                        <span className="material-symbols-outlined text-[16px]">dashboard</span>
                        Pharmacy Executive Sales Dashboard
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Pharmacy Sales & Financial Overview</h1>
                    <p className="text-emerald-200 text-sm max-w-xl">Total sales tracking, revenue analytics, payment mode breakdown, and prescription processing.</p>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/pharmacy/billing')}
                        className="bg-white text-emerald-900 px-5 py-3 rounded-2xl font-extrabold text-sm shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                        + New Bill (POS Terminal)
                    </button>
                </div>
            </div>

            {/* Main Financial KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface-variant uppercase">Total Sales Revenue</span>
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">payments</span>
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-700 font-mono">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</div>
                    <div className="text-[11px] text-emerald-800 font-bold">Today: ₹{stats.todayRevenue?.toLocaleString('en-IN') || 0}</div>
                </div>

                {/* Total Sales Count */}
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface-variant uppercase">Total Bills Processed</span>
                        <span className="material-symbols-outlined text-indigo-600 text-[20px]">receipt_long</span>
                    </div>
                    <div className="text-3xl font-extrabold text-indigo-700">{stats.totalSalesCount || 0}</div>
                    <div className="text-[11px] text-indigo-800 font-bold">Today's Bills: {stats.todaySalesCount || 0}</div>
                </div>

                {/* Average Bill Value */}
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface-variant uppercase">Average Bill Value</span>
                        <span className="material-symbols-outlined text-teal-600 text-[20px]">calculate</span>
                    </div>
                    <div className="text-3xl font-extrabold text-teal-700 font-mono">₹{stats.avgBillValue || 0}</div>
                    <div className="text-[11px] text-on-surface-variant">per customer transaction</div>
                </div>

                {/* Medicines & Stock */}
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface-variant uppercase">Medicine Catalog</span>
                        <span className="material-symbols-outlined text-amber-600 text-[20px]">science</span>
                    </div>
                    <div className="text-3xl font-extrabold text-on-surface">{stats.totalMedicines || 0}</div>
                    <div className="text-[11px] font-bold text-rose-600">
                        {stats.lowStockCount || 0} Low Stock • {stats.outOfStockCount || 0} Out
                    </div>
                </div>
            </div>

            {/* Payment Method Breakdown Cards */}
            <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[22px]">account_balance_wallet</span>
                    Payment Method Revenue Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CASH */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                💵 Cash Payments
                            </div>
                            <div className="text-2xl font-extrabold text-emerald-800 font-mono">
                                ₹{stats.paymentBreakdown?.CASH?.amount?.toFixed(2) || 0}
                            </div>
                        </div>
                        <div className="bg-emerald-200/60 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-900 font-mono">
                            {stats.paymentBreakdown?.CASH?.count || 0} Bills
                        </div>
                    </div>

                    {/* CARD */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                💳 Card Payments
                            </div>
                            <div className="text-2xl font-extrabold text-blue-800 font-mono">
                                ₹{stats.paymentBreakdown?.CARD?.amount?.toFixed(2) || 0}
                            </div>
                        </div>
                        <div className="bg-blue-200/60 px-3 py-1.5 rounded-xl text-xs font-extrabold text-blue-900 font-mono">
                            {stats.paymentBreakdown?.CARD?.count || 0} Bills
                        </div>
                    </div>

                    {/* UPI */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                📱 UPI / Online
                            </div>
                            <div className="text-2xl font-extrabold text-purple-800 font-mono">
                                ₹{stats.paymentBreakdown?.UPI?.amount?.toFixed(2) || 0}
                            </div>
                        </div>
                        <div className="bg-purple-200/60 px-3 py-1.5 rounded-xl text-xs font-extrabold text-purple-900 font-mono">
                            {stats.paymentBreakdown?.UPI?.count || 0} Bills
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Section: Recent Sales & Top Selling Medicines */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sales History (2 Columns) */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden space-y-4">
                    <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                        <div>
                            <h3 className="font-headline-sm text-xl font-bold text-on-surface">Recent Sales History ({stats.recentSales?.length || 0})</h3>
                            <p className="text-xs text-on-surface-variant">Live record of all pharmacy transactions and customer bills.</p>
                        </div>
                        <button onClick={() => navigate('/pharmacy/billing')} className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700">
                            + New Bill
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                    <th className="p-3.5">Bill Ref</th>
                                    <th className="p-3.5">Customer Name</th>
                                    <th className="p-3.5">Payment</th>
                                    <th className="p-3.5">Date & Time</th>
                                    <th className="p-3.5">Amount</th>
                                    <th className="p-3.5 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-xs">
                                {stats.recentSales?.length === 0 ? (
                                    <tr><td colSpan={6} className="p-6 text-center text-on-surface-variant">No sales transactions recorded yet.</td></tr>
                                ) : stats.recentSales?.map((s) => (
                                    <tr key={s.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-emerald-800">{s.billRef}</td>
                                        <td className="p-3.5 font-bold text-on-surface">
                                            {s.customerName}
                                            {s.customerPhone !== 'N/A' && <div className="text-[10px] text-on-surface-variant">{s.customerPhone}</div>}
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                s.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' :
                                                s.paymentMethod === 'CARD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {s.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-mono text-[11px]">
                                            {new Date(s.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-3.5 font-mono font-extrabold text-emerald-700 text-sm">
                                            ₹{s.totalAmount?.toFixed(2)}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedSale(s)}
                                                className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg font-bold text-[11px] hover:bg-emerald-100"
                                            >
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Medicines (1 Column) */}
                <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-[22px]">trending_up</span>
                            Top Selling Medicines
                        </h3>
                        <p className="text-xs text-on-surface-variant">Frequently sold medicines based on billing volume.</p>
                    </div>

                    <div className="space-y-3">
                        {stats.topSellingMedicines?.length === 0 ? (
                            <div className="text-xs text-on-surface-variant text-center py-6">No sales data recorded yet.</div>
                        ) : stats.topSellingMedicines?.map((item, idx) => (
                            <div key={idx} className="p-3.5 bg-surface-container-low rounded-2xl border flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xs text-on-surface">💊 {item.name}</div>
                                    <div className="text-[11px] text-emerald-700 font-bold">Qty Sold: {item.quantitySold} units</div>
                                </div>
                                <div className="text-right font-mono font-extrabold text-emerald-800 text-sm">
                                    ₹{item.totalRevenue?.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctor Prescriptions Queue */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden space-y-4">
                <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                    <div>
                        <h3 className="font-headline-sm text-xl font-bold text-on-surface">Pending Doctor Prescriptions ({rxQueue.filter(r => !r.dispensed).length})</h3>
                        <p className="text-xs text-on-surface-variant">OPD doctor prescriptions waiting for medicine fulfillment.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Patient</th>
                                <th className="p-4">Prescribing Doctor</th>
                                <th className="p-4">Medicines Prescribed</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {rxQueue.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-bold text-on-surface">
                                        {row.patient?.user?.name || 'Walk-in Patient'}
                                        <div className="text-xs text-emerald-700 font-mono">{row.patient?.patientCode || 'PAT-2026-0001'}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-on-surface">
                                        Dr. {row.doctor?.user?.name || 'Robert Vance'}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-emerald-900">
                                        💊 {row.items?.length || 1} Items
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            row.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                        }`}>
                                            {row.dispensed ? 'DISPENSED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {!row.dispensed ? (
                                            <button
                                                onClick={() => { setSelectedRx(row); setShowDispenseModal(true); }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ml-auto"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">medication</span>
                                                Dispense
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                                                Dispensed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DISPENSE MODAL */}
            {showDispenseModal && selectedRx && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-on-surface">Dispense Prescription</h3>
                                <p className="text-xs text-emerald-700 font-bold">{selectedRx.patient?.user?.name}</p>
                            </div>
                            <button onClick={() => setShowDispenseModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div>
                            <label className="text-xs font-bold block mb-1">Select Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border p-3 rounded-xl text-sm font-bold text-emerald-900">
                                <option value="CASH">Cash</option>
                                <option value="CARD">Debit / Credit Card</option>
                                <option value="UPI">UPI / GPay</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowDispenseModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                            <button onClick={handleDispenseRx} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700">
                                Dispense & Collect Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINT RECEIPT MODAL */}
            {selectedSale && (
                <PrintBillReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
            )}
        </div>
    );
};

export default PharmacyDashboard;
