import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/admin/all-doctors');
                setDoctors(response.data.data);
            } catch (error) {
                console.error("Error fetching doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/approve-doctor/${userId}`);
            setDoctors(doctors.map(doc => doc.user_id === userId ? { ...doc, is_approved: true } : doc));
            toast.success("Doctor Approved Successfully!");
        } catch (error) {
            toast.error("Failed to approve doctor.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading doctors list...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight mb-2">Doctor Directory</h2>
                <p className="font-body-lg text-lg text-on-surface-variant max-w-md">Manage doctor registrations, verify credentials, and oversee platform access.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Doctor Details</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Specialization & Address</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Certificate</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {doctors.map((row) => (
                                <tr key={row.user_id} className="hover:bg-surface-container-lowest transition-colors group">
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                                                {row.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-label-md font-bold text-on-surface">{row.name}</div>
                                                <div className="text-xs text-on-surface-variant mt-0.5">{row.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span>
                                            <span className="font-label-md text-primary font-semibold">{row.specialization}</span>
                                        </div>
                                        <div className="text-xs text-on-surface-variant flex items-start gap-1">
                                            <span className="material-symbols-outlined text-[14px] mt-0.5">location_on</span>
                                            {row.hospital_address || 'Not provided'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <a 
                                            href={`http://localhost:5000${row.certificate_url}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-1.5 text-sm font-label-md font-semibold text-secondary hover:text-secondary-hover hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                                            View Doc
                                        </a>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-label-sm font-bold uppercase tracking-wider rounded-full ${
                                            row.is_approved 
                                            ? 'bg-tertiary-container text-on-tertiary-container' 
                                            : 'bg-error-container text-on-error-container'
                                        }`}>
                                            <span className="material-symbols-outlined text-[14px]">
                                                {row.is_approved ? 'verified' : 'pending_actions'}
                                            </span>
                                            {row.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 align-middle text-right">
                                        {!row.is_approved ? (
                                            <button 
                                                onClick={() => handleApprove(row.user_id)}
                                                className="bg-primary text-white px-4 py-2 rounded-xl font-label-md font-bold hover:bg-primary-hover active:scale-95 transition-all shadow-sm flex items-center gap-2 ml-auto"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                                                Approve
                                            </button>
                                        ) : (
                                            <span className="text-on-surface-variant text-xs font-label-md font-semibold flex items-center justify-end gap-1">
                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                                Resolved
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                                        No doctors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDoctors;