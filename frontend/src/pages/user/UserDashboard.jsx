import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/dashboard');
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load patient dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const patient = data?.patient || {};
    const nextAppt = data?.nextAppointment;
    const recentPresc = data?.recentPrescription;
    const pendingBill = data?.pendingBill;
    const recentLab = data?.recentLabRequest;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
            {/* Header with Patient Name & ID Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-2xl shadow-sm">
                        <span className="material-symbols-outlined text-[32px]">person</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-on-surface">Hello, {patient.name || user?.name || 'Patient'}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                                {patient.patientCode || 'PAT-ID'}
                            </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Blood Group: <span className="font-bold text-on-surface">{patient.bloodGroup || 'Not set'}</span> • Phone: <span className="font-bold text-on-surface">{patient.phone || user?.phone || 'Not set'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/user/search')}
                        className="px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                        Book Appointment
                    </button>
                    <button
                        onClick={() => navigate('/user/profile')}
                        className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                        My Profile
                    </button>
                </div>
            </div>

            {/* 4 Core Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Next Appointment */}
                <div
                    onClick={() => navigate('/user/appointments')}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">Next Appointment</span>
                        <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        </div>
                    </div>
                    <div className="my-3">
                        {nextAppt ? (
                            <>
                                <p className="font-bold text-sm text-on-surface line-clamp-1">Dr. {nextAppt.doctor?.user?.name}</p>
                                <p className="text-xs text-on-surface-variant">{nextAppt.department?.name || 'Consultation'}</p>
                                <p className="text-xs font-black text-cyan-700 mt-2">
                                    {new Date(nextAppt.date).toLocaleDateString()} at {nextAppt.startTime}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-on-surface-variant py-2">No upcoming consultations scheduled.</p>
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-cyan-600 inline-flex items-center gap-1">
                        View Appointments <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </div>

                {/* 2. Recent Prescription */}
                <div
                    onClick={() => navigate('/user/prescriptions')}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">Latest Prescription</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                        </div>
                    </div>
                    <div className="my-3">
                        {recentPresc ? (
                            <>
                                <p className="font-bold text-sm text-on-surface line-clamp-1">Dr. {recentPresc.doctor?.user?.name}</p>
                                <p className="text-xs text-on-surface-variant">{recentPresc.items?.length || 0} Medicines Prescribed</p>
                                <p className="text-xs font-bold text-emerald-700 mt-2">
                                    Date: {new Date(recentPresc.createdAt).toLocaleDateString()}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-on-surface-variant py-2">No prescriptions recorded yet.</p>
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                        View Prescriptions <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </div>

                {/* 3. Pending Bill */}
                <div
                    onClick={() => navigate('/user/billing')}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">Billing & Dues</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                        </div>
                    </div>
                    <div className="my-3">
                        {pendingBill && pendingBill.pendingAmount > 0 ? (
                            <>
                                <p className="font-black text-xl text-rose-600">₹{pendingBill.pendingAmount.toFixed(2)}</p>
                                <p className="text-xs text-on-surface-variant">Outstanding Balance (#INV-{pendingBill.id.slice(0, 6).toUpperCase()})</p>
                                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                                    Payment Pending
                                </span>
                            </>
                        ) : (
                            <>
                                <p className="font-black text-xl text-emerald-600">₹0.00</p>
                                <p className="text-xs text-on-surface-variant">All hospital dues are cleared.</p>
                                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                    All Paid
                                </span>
                            </>
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 inline-flex items-center gap-1">
                        View Bills & Receipts <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </div>

                {/* 4. Recent Lab Report */}
                <div
                    onClick={() => navigate('/user/lab-reports')}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:border-purple-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">Lab Report</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">science</span>
                        </div>
                    </div>
                    <div className="my-3">
                        {recentLab ? (
                            <>
                                <p className="font-bold text-sm text-on-surface line-clamp-1">{recentLab.testName}</p>
                                <p className="text-xs text-on-surface-variant">Dr. {recentLab.doctor?.user?.name}</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    recentLab.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                    {recentLab.status === 'COMPLETED' ? 'Report Ready' : recentLab.status}
                                </span>
                            </>
                        ) : (
                            <p className="text-xs text-on-surface-variant py-2">No recent lab test requests.</p>
                        )}
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 inline-flex items-center gap-1">
                        View Lab Reports <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
                <h2 className="text-base font-bold text-on-surface mb-4">Patient Care Services</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/user/search')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[26px]">search</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Find Doctors</span>
                    </button>
                    <button
                        onClick={() => navigate('/user/prescriptions')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[26px]">prescriptions</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">My Prescriptions</span>
                    </button>
                    <button
                        onClick={() => navigate('/user/lab-reports')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[26px]">science</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Diagnostic Reports</span>
                    </button>
                    <button
                        onClick={() => navigate('/user/billing')}
                        className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 flex flex-col items-center text-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
                            <span className="material-symbols-outlined text-[26px]">receipt_long</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface">Bills & Invoices</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;