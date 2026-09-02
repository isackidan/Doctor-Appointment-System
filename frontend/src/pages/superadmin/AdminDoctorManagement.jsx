import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            const res = await api.get('/admin/doctors', { params });
            setDoctors(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doctorId) => {
        try {
            await api.put(`/admin/approve-doctor/${doctorId}`);
            toast.success('Doctor account approved!');
            fetchDoctors();
        } catch (err) {
            toast.error('Failed to approve doctor');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Doctor Directory & Practice Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Manage medical practitioners, practice fees, departments, and onboarding approvals.</p>
                </div>
                <button
                    onClick={fetchDoctors}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition self-start sm:self-auto"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search doctor by name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/30 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Doctors Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Doctor Name</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Specialization</th>
                                <th className="p-4">Consultation Fee</th>
                                <th className="p-4">Total Consultations</th>
                                <th className="p-4">Approval Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading doctors...</span>
                                    </td>
                                </tr>
                            ) : doctors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-on-surface-variant">
                                        No doctors found.
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-bold text-on-surface">
                                            Dr. {doc.user?.name}
                                            <p className="text-[10px] text-on-surface-variant font-normal">{doc.user?.email}</p>
                                        </td>
                                        <td className="p-4 text-on-surface font-semibold">
                                            {doc.department?.name || 'General Medicine'}
                                        </td>
                                        <td className="p-4 text-on-surface">{doc.specialization}</td>
                                        <td className="p-4 font-bold text-emerald-700">₹{doc.consultationFee.toFixed(2)}</td>
                                        <td className="p-4 font-bold text-on-surface">{doc.appointmentCount || 0}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                doc.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                            }`}>
                                                {doc.isApproved ? 'APPROVED' : 'PENDING REVIEW'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {!doc.isApproved ? (
                                                <button
                                                    onClick={() => handleApprove(doc.id)}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm inline-flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    Approve Practice
                                                </button>
                                            ) : (
                                                <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">verified</span> Active
                                                </span>
                                            )}
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

export default AdminDoctorManagement;
