import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/bills');
            setBills(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load bills');
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
                    <h1 className="text-2xl font-bold text-on-surface">Bills & Payment History</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Review your medical bills, payment receipts, and balance dues.</p>
                </div>
                <button
                    onClick={fetchBills}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Bills Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Bill Date</th>
                                <th className="p-4">Bill No</th>
                                <th className="p-4">Doctor / Service</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Pending</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading billing statements...</span>
                                    </td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">receipt_long</span>
                                        <p className="font-bold">No bills or invoices on file.</p>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => {
                                    const isPaid = bill.paymentStatus === 'PAID' || bill.pendingAmount <= 0;
                                    const isPartial = bill.paidAmount > 0 && bill.pendingAmount > 0;

                                    return (
                                        <tr key={bill.id} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-4 text-on-surface">
                                                {new Date(bill.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-cyan-700">
                                                INV-{bill.id.slice(0, 8).toUpperCase()}
                                            </td>
                                            <td className="p-4 font-bold text-on-surface">
                                                Dr. {bill.appointment?.doctor?.user?.name || 'General OPD'}
                                                <p className="text-[10px] font-normal text-on-surface-variant">{bill.appointment?.department?.name}</p>
                                            </td>
                                            <td className="p-4 font-bold text-on-surface text-sm">
                                                ₹{bill.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold text-emerald-600">
                                                ₹{bill.paidAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold text-rose-600">
                                                ₹{bill.pendingAmount.toFixed(2)}
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
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedBill(bill)}
                                                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">receipt</span>
                                                    View Bill
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

            {/* View & Print Bill Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
                    <div className="bg-surface rounded-2xl max-w-xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden print:shadow-none print:border-none print:w-full">
                        {/* Modal Header */}
                        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between print:hidden">
                            <h3 className="text-base font-bold text-on-surface">Patient Billing Statement</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-cyan-700 transition"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span> Print
                                </button>
                                <button
                                    onClick={() => setSelectedBill(null)}
                                    className="p-1 text-on-surface-variant hover:text-rose-600 transition"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Printable Area */}
                        <div className="p-8 space-y-6 text-on-surface">
                            <div className="text-center border-b border-outline-variant/30 pb-4">
                                <h2 className="text-2xl font-black text-cyan-800">Lumina Health & Research Hospital</h2>
                                <p className="text-xs text-on-surface-variant">Patient Billing & Payment Statement</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-on-surface-variant">Invoice No:</p>
                                    <p className="font-mono font-bold text-sm text-cyan-800">INV-{selectedBill.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-on-surface-variant">Bill Date: {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant">Doctor / Service:</p>
                                    <p className="font-bold text-on-surface">Dr. {selectedBill.appointment?.doctor?.user?.name || 'Consultation'}</p>
                                    <p className="text-on-surface-variant">{selectedBill.appointment?.department?.name}</p>
                                </div>
                            </div>

                            <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-surface-container-lowest border-b font-bold">
                                        <tr>
                                            <th className="p-3">Description</th>
                                            <th className="p-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        <tr>
                                            <td className="p-3 font-semibold">Doctor Consultation Fee</td>
                                            <td className="p-3 text-right font-bold">₹{(selectedBill.appointment?.doctorFee || selectedBill.subTotal || 500).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-semibold">Hospital Service & Administration</td>
                                            <td className="p-3 text-right font-bold">₹{(selectedBill.appointment?.adminCommission || 50).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-surface-container font-bold border-t border-outline-variant/20">
                                        <tr>
                                            <td className="p-3">Total Amount</td>
                                            <td className="p-3 text-right text-sm font-black text-cyan-800">₹{selectedBill.totalAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 text-emerald-700">Total Paid</td>
                                            <td className="p-3 text-right text-emerald-700">₹{selectedBill.paidAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 text-rose-700">Pending Dues</td>
                                            <td className="p-3 text-right text-rose-700">₹{selectedBill.pendingAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Recorded Payment Receipts */}
                            {selectedBill.payments?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Payment Transactions</h4>
                                    <div className="space-y-1">
                                        {selectedBill.payments.map((p) => (
                                            <div key={p.id} className="flex justify-between text-xs bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
                                                <span>{new Date(p.paidAt).toLocaleDateString()} • {p.paymentMethod} (Ref: {p.referenceNo || 'N/A'})</span>
                                                <span className="font-bold text-emerald-600">₹{p.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-end text-xs">
                                <div>
                                    <p className="text-[10px] text-on-surface-variant">Payments can be cleared at the hospital accounts desk.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-32 border-b border-outline-variant/40 mb-1"></div>
                                    <p className="text-[10px] font-bold text-on-surface">Accounts Desk</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBills;
