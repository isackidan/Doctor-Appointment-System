import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { key: 'CASH', label: 'Cash', icon: '💵', color: 'bg-green-600' },
  { key: 'CARD', label: 'Card', icon: '💳', color: 'bg-blue-600' },
  { key: 'UPI', label: 'UPI / Online', icon: '📱', color: 'bg-purple-600' },
];

const CATEGORIES = ['All', 'Analgesic', 'Antibiotic', 'Cardiac', 'Diabetes', 'Gastro', 'Respiratory', 'Vitamins', 'Neurology', 'Dermatology'];

// ─── BILL RECEIPT PRINT VIEW ──────────────────────────────────────────────────
const PrintReceipt = ({ receipt }) => {
  const lines = receipt.cartItems;
  return (
    <div id="print-receipt" className="hidden print:block text-xs font-mono p-4">
      <div className="text-center font-bold text-sm border-b pb-2 mb-2">LUMINA HEALTH SYSTEM</div>
      <div className="text-center text-[10px] mb-2">Hospital Pharmacy Counter | Ph: 044-2000-3456</div>
      <div className="flex justify-between mb-1"><span>Bill Ref:</span><span className="font-bold">{receipt.billRef}</span></div>
      <div className="flex justify-between mb-1"><span>Date:</span><span>{new Date(receipt.createdAt).toLocaleString()}</span></div>
      <div className="flex justify-between mb-1"><span>Customer:</span><span className="font-bold">{receipt.customerName}</span></div>
      {receipt.customerPhone !== 'N/A' && <div className="flex justify-between mb-2"><span>Phone:</span><span>{receipt.customerPhone}</span></div>}
      <div className="border-t border-b my-2 py-1">
        {lines.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="flex-1">{item.medicineName}</span>
            <span className="w-10 text-right">{item.quantity}</span>
            <span className="w-14 text-right">₹{item.unitPrice}</span>
            <span className="w-16 text-right font-bold">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between"><span>Sub Total:</span><span>₹{receipt.subTotal.toFixed(2)}</span></div>
      {receipt.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({receipt.discount}%):</span><span>-₹{receipt.discountAmount.toFixed(2)}</span></div>}
      <div className="flex justify-between font-bold text-sm border-t mt-1 pt-1"><span>TOTAL PAID:</span><span>₹{receipt.totalAmount.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Payment:</span><span>{receipt.paymentMethod}</span></div>
      {receipt.paymentMethod === 'CASH' && receipt.changeAmount > 0 && (
        <div className="flex justify-between"><span>Change Returned:</span><span>₹{receipt.changeAmount.toFixed(2)}</span></div>
      )}
      <div className="text-center mt-3 text-[10px]">Thank you! Get Well Soon 💊</div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PharmacyBilling = () => {
  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Medicine Search & Catalog
  const [allMedicines, setAllMedicines] = useState([]);
  const [medSearch, setMedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCatalog, setShowCatalog] = useState(false);

  // Cart
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  // Payment
  const [step, setStep] = useState('billing'); // billing | payment | success
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [upiRef, setUpiRef] = useState('');

  // Receipt
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const medSearchRef = useRef(null);

  // Load all medicines on mount
  useEffect(() => {
    api.get('/pharmacy/medicines/search?limit=100')
      .then(r => setAllMedicines(r.data.data || []))
      .catch(() => {});
  }, []);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (med) => {
    const totalStock = med.stocks?.reduce((s, b) => s + b.quantity, 0) || 0;
    setCart(prev => {
      const exist = prev.find(i => i.medicineId === med.id);
      if (exist) {
        return prev.map(i => i.medicineId === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        medicineId: med.id,
        medicineName: med.name,
        category: med.category,
        unitPrice: med.unitPrice,
        quantity: 1,
        availableStock: totalStock
      }];
    });
    toast.success(`${med.name} added to bill!`, { duration: 1200 });
  };

  const updateQty = (medicineId, qty) => {
    const n = Math.max(1, parseInt(qty) || 1);
    setCart(prev => prev.map(i => i.medicineId === medicineId ? { ...i, quantity: n } : i));
  };

  const removeItem = (medicineId) => {
    setCart(prev => prev.filter(i => i.medicineId !== medicineId));
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const subTotal = cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const discountAmt = parseFloat((subTotal * (discount / 100)).toFixed(2));
  const grandTotal = parseFloat((subTotal - discountAmt).toFixed(2));
  const change = parseFloat(amountPaid || 0) - grandTotal;

  // ── Filtered catalog ────────────────────────────────────────────────────────
  const filteredMeds = allMedicines.filter(m => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = !medSearch || m.name.toLowerCase().includes(medSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Process payment ─────────────────────────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!customerName.trim()) { toast.error('Enter customer name first'); return; }
    if (cart.length === 0) { toast.error('Add at least one medicine'); return; }
    if (paymentMethod === 'CASH' && parseFloat(amountPaid || 0) < grandTotal) {
      toast.error(`Cash amount must be ≥ ₹${grandTotal.toFixed(2)}`); return;
    }

    setLoading(true);
    try {
      const res = await api.post('/pharmacy/billing/walk-in', {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        cartItems: cart,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? parseFloat(amountPaid) : grandTotal,
        discount
      });
      setReceipt(res.data.data);
      setStep('success');
      toast.success('Payment Successful! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Billing failed');
    } finally {
      setLoading(false);
    }
  };

  // ── New Bill ────────────────────────────────────────────────────────────────
  const resetAll = () => {
    setCustomerName(''); setCustomerPhone('');
    setCart([]); setDiscount(0);
    setAmountPaid(''); setUpiRef('');
    setPaymentMethod('CASH');
    setStep('billing'); setReceipt(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'success' && receipt) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-in fade-in duration-500">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Green Header */}
          <div className="bg-emerald-600 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-3 animate-bounce">✅</div>
              <h2 className="text-3xl font-extrabold tracking-tight">Payment Successful!</h2>
              <p className="text-emerald-100 text-sm mt-1">Medicine dispensed & stock updated.</p>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-sm font-mono">
              <div className="flex justify-between"><span className="text-emerald-900 font-bold">Bill Reference</span><span className="font-extrabold text-emerald-700">{receipt.billRef}</span></div>
              <div className="flex justify-between"><span>Customer</span><span className="font-bold">{receipt.customerName}</span></div>
              {receipt.customerPhone !== 'N/A' && <div className="flex justify-between"><span>Phone</span><span>{receipt.customerPhone}</span></div>}
              <div className="flex justify-between"><span>Payment Mode</span><span className="font-bold uppercase">{receipt.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Date & Time</span><span>{new Date(receipt.createdAt).toLocaleString()}</span></div>
              <div className="border-t pt-2 flex justify-between text-base"><span className="font-bold">Total Paid</span><span className="font-extrabold text-emerald-700 text-lg">₹{receipt.totalAmount.toFixed(2)}</span></div>
              {receipt.paymentMethod === 'CASH' && receipt.changeAmount > 0 && (
                <div className="flex justify-between bg-amber-50 border border-amber-200 rounded-xl p-2"><span className="font-bold text-amber-900">💵 Change to Return</span><span className="font-extrabold text-amber-700 text-base">₹{receipt.changeAmount.toFixed(2)}</span></div>
              )}
            </div>

            {/* Items in Receipt */}
            <div className="border rounded-2xl overflow-hidden text-xs">
              <div className="bg-surface-container-low p-3 font-bold text-on-surface-variant uppercase">Medicine Items Dispensed</div>
              <div className="divide-y">
                {receipt.cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between p-3">
                    <span className="font-semibold">{item.medicineName}</span>
                    <span className="text-on-surface-variant">×{item.quantity}</span>
                    <span className="font-bold text-emerald-700 font-mono">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => window.print()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">print</span> Print Bill Receipt
              </button>
              <button onClick={resetAll} className="flex-1 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[20px]">add_circle</span> New Bill
              </button>
            </div>
          </div>
        </div>
        {receipt && <PrintReceipt receipt={receipt} />}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PAYMENT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'payment') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-emerald-900 text-white p-6 flex items-center gap-3">
            <button onClick={() => setStep('billing')} className="p-2 rounded-full hover:bg-white/10 transition">
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold">Collect Payment</h2>
              <p className="text-emerald-200 text-xs">Customer: <strong>{customerName}</strong></p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Bill Total Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <p className="text-xs font-bold text-emerald-900 uppercase">Amount to Collect</p>
              <p className="text-5xl font-extrabold text-emerald-700 font-mono mt-1">₹{grandTotal.toFixed(2)}</p>
              {discountAmt > 0 && <p className="text-xs text-emerald-600 mt-1">After {discount}% discount (saved ₹{discountAmt.toFixed(2)})</p>}
            </div>

            {/* Payment Method Selector */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all font-bold text-sm ${paymentMethod === m.key ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md scale-105' : 'border-outline-variant/30 text-on-surface hover:border-emerald-300'}`}>
                    <div className="text-2xl mb-1">{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash: Amount Tendered + Change */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Cash Tendered by Customer (₹)</label>
                  <input type="number" step="0.50" min={grandTotal} placeholder={`Min. ₹${grandTotal.toFixed(2)}`}
                    value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                    className="w-full border-2 p-4 rounded-2xl text-2xl font-mono font-bold text-center focus:border-emerald-500 outline-none" />
                </div>
                {parseFloat(amountPaid || 0) >= grandTotal && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
                    <span className="font-bold text-amber-900">💵 Return Change</span>
                    <span className="text-2xl font-extrabold text-amber-700 font-mono">₹{change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Card */}
            {paymentMethod === 'CARD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-2">
                <div className="text-4xl">💳</div>
                <p className="font-bold text-blue-900">Swipe or Insert Card</p>
                <p className="text-xs text-blue-700">Amount: <strong>₹{grandTotal.toFixed(2)}</strong> — Approve on terminal</p>
              </div>
            )}

            {/* UPI */}
            {paymentMethod === 'UPI' && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center space-y-3">
                <div className="text-4xl">📱</div>
                <p className="font-bold text-purple-900">Pay via UPI / GPay / PhonePe</p>
                <p className="text-xs font-mono text-purple-700">UPI ID: lumina.pharmacy@hdfc</p>
                <p className="text-sm font-bold">Amount: ₹{grandTotal.toFixed(2)}</p>
                <input type="text" placeholder="Enter UPI Transaction Reference No."
                  value={upiRef} onChange={e => setUpiRef(e.target.value)}
                  className="w-full border-2 p-3 rounded-xl text-sm text-center font-mono focus:border-purple-500 outline-none" />
              </div>
            )}

            {/* Confirm Button */}
            <button onClick={handleProcessPayment} disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-extrabold text-lg shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin material-symbols-outlined text-[22px]">progress_activity</span> Processing...</>
              ) : (
                <><span className="material-symbols-outlined text-[22px]">check_circle</span> Confirm & Complete Payment</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  BILLING / POS TERMINAL
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-emerald-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Pharmacy POS Billing Terminal
          </div>
          <h1 className="font-display text-3xl font-bold">New Customer Bill</h1>
          <p className="text-emerald-200 text-sm mt-1">Walk-in or prescription-based medicine billing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Medicine Catalog ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-sm text-on-surface uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">person_add</span>
              Walk-In Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Customer Name <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="e.g. Mr. Rajesh Kumar"
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full border-2 p-3 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Mobile Number (Optional)</label>
                <input type="tel" placeholder="e.g. +91 9876543210"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border-2 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Medicine Catalog */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">medication</span>
                <h3 className="font-bold text-sm text-on-surface uppercase">Medicine Catalog ({allMedicines.length} Available)</h3>
              </div>
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input type="text" placeholder="Type medicine name to search... (e.g. Paracetamol, Amlodipine)"
                  value={medSearch} onChange={e => setMedSearch(e.target.value)} ref={medSearchRef}
                  className="w-full border-2 py-2.5 pl-10 pr-4 rounded-xl text-sm focus:border-emerald-500 outline-none" />
              </div>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${activeCategory === c ? 'bg-emerald-600 text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-emerald-100'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Grid */}
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
              {filteredMeds.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-on-surface-variant text-sm">No medicines found.</div>
              ) : filteredMeds.map(med => {
                const stock = med.stocks?.reduce((s, b) => s + b.quantity, 0) || 0;
                const inCart = cart.find(i => i.medicineId === med.id);
                return (
                  <button key={med.id} onClick={() => addToCart(med)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${inCart ? 'border-emerald-500 bg-emerald-50' : 'border-outline-variant/30 hover:border-emerald-300 bg-white'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-on-surface truncate">💊 {med.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{med.category} • Stock: {stock}</div>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <div className="font-extrabold text-emerald-700 font-mono text-sm">₹{med.unitPrice}</div>
                      {inCart && <div className="text-[10px] font-bold text-emerald-600">✓ In Cart</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Billing Cart ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden sticky top-4">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                <h3 className="font-bold text-base">Billing Cart</h3>
              </div>
              <span className="bg-white text-emerald-900 font-extrabold text-xs px-2 py-0.5 rounded-full">{cart.length} Items</span>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[40px] block mb-2 text-emerald-200">shopping_cart</span>
                Click medicines on the left to add to bill.
              </div>
            ) : (
              <div className="divide-y max-h-[340px] overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-on-surface truncate">{item.medicineName}</div>
                        <div className="text-[10px] text-on-surface-variant">₹{item.unitPrice} per unit</div>
                      </div>
                      <button onClick={() => removeItem(item.medicineId)} className="text-rose-400 hover:text-rose-600 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border-2 border-emerald-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.medicineId, item.quantity - 1)} className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-700 text-sm">−</button>
                        <span className="px-3 py-1.5 font-mono font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.medicineId, item.quantity + 1)} className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-700 text-sm">+</button>
                      </div>
                      <span className="font-extrabold text-emerald-700 font-mono text-sm">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals & Discount */}
            {cart.length > 0 && (
              <div className="p-4 border-t space-y-2 bg-surface-container-lowest">
                {/* Discount */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-on-surface-variant w-24 shrink-0">Discount %</label>
                  <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-full border-2 p-2 rounded-xl text-sm font-mono font-bold text-center focus:border-emerald-500 outline-none" />
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Sub Total</span><span className="font-mono">₹{subTotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount ({discount}%)</span><span className="font-mono">-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base border-t pt-2">
                  <span>Grand Total</span><span className="font-mono text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>

                {/* Proceed to Payment */}
                <button onClick={() => {
                  if (!customerName.trim()) { toast.error('Enter customer name first'); return; }
                  setStep('payment');
                }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-lg transition-all mt-2 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  Proceed to Payment (₹{grandTotal.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyBilling;
