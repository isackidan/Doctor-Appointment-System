import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter, dateFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (dateFilter) params.date = dateFilter;
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/admin/appointments', { params });
            setAppointments(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAppointments();
    };

    const handleQuickToday = () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setDateFilter(todayStr);
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Appointment Master Registry</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Centralized scheduling oversight, doctor consultations, token queue, and visit status.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleQuickToday}
                        className="px-3 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                    >
                        Today's Visits
                    </button>
                    <button
                        onClick={() => { setDateFilter(''); setStatusFilter('ALL'); setSearchQuery(''); }}
                        className="p-2 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Clear Filters"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {['ALL', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'TREATMENT_COMPLETED', 'CANCELLED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === st ? 'bg-blue-600 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            {st.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search doctor or patient name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                            Search
                        </button>
                    </form>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant">Date:</span>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Token #</th>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Doctor</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Consultation Fee</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading appointments...</span>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-on-surface-variant">
                                        No appointments matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface">
                                            <p className="font-bold">{new Date(appt.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-on-surface-variant">{appt.startTime} - {appt.endTime}</p>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-blue-700">{appt.token?.tokenNumber || 'Queue #'}</td>
                                        <td className="p-4 font-bold text-on-surface">
                                            {appt.patient?.user?.name}
                                            <p className="text-[10px] text-on-surface-variant font-normal">ID: {appt.patient?.patientCode}</p>
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">Dr. {appt.doctor?.user?.name}</td>
                                        <td className="p-4 text-on-surface">{appt.department?.name || 'OPD'}</td>
                                        <td className="p-4 font-bold text-emerald-700">₹{(appt.doctorFee || 500).toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                appt.status === 'TREATMENT_COMPLETED' || appt.status === 'PAYMENT_COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                appt.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-800' :
                                                appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                                {appt.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointmentManagement;
