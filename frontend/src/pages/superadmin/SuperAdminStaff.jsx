import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = [
    'ALL', 'SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE',
    'LAB_TECHNICIAN', 'PHARMACY', 'ACCOUNTS', 'PATIENT'
];

const SuperAdminStaff = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [activeRole, setActiveRole] = useState('ALL');

    // Onboard Modal
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [createdStaffData, setCreatedStaffData] = useState(null);
    const [onboardForm, setOnboardForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'RECEPTIONIST',
        specialization: 'General Medicine',
        consultationFee: '500',
        hospitalAddress: 'Lumina Main Hospital'
    });

    useEffect(() => {
        fetchUsers();
    }, [search, activeRole, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...(search ? { search } : {}),
                ...(activeRole !== 'ALL' ? { role: activeRole } : {}),
                page: currentPage,
                limit: 20
            });
            const res = await api.get(`/admin/users?${params.toString()}`);
            setUsers(res.data.users || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch (err) {
            toast.error('Failed to load staff directory');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const res = await api.put(`/admin/users/${userId}/toggle-status`);
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to toggle account status');
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/create-staff', onboardForm);
            setCreatedStaffData(res.data.data);
            toast.success('Staff account onboarded successfully!');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Onboarding failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Staff Account Onboarding & Directory</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Manage user accounts across all 8 hospital roles with WhatsApp credential sharing.</p>
                </div>
                <button
                    onClick={() => { setCreatedStaffData(null); setShowOnboardModal(true); }}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Onboard New Staff Member
                </button>
            </div>

            {/* Search & Role Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search staff by name, email, or phone..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full border-2 py-3 pl-11 pr-4 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {ROLES.map(role => (
                        <button
                            key={role}
                            onClick={() => { setActiveRole(role); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                activeRole === role ? 'bg-blue-600 text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-blue-100'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Staff Directory Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                    <h3 className="font-headline-sm text-xl font-bold text-on-surface">Hospital Staff Directory ({total})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b text-xs uppercase font-label-sm tracking-wider text-on-surface-variant">
                                <th className="p-4">Staff Member</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Joined Date</th>
                                <th className="p-4">Account Status</th>
                                <th className="p-4 text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-sm">
                            {users.map((row) => (
                                <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-bold text-on-surface">
                                        👤 {row.name}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-900 border border-blue-300">
                                            {row.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-mono">
                                        {row.email}
                                        {row.phone && <div className="text-[11px] text-on-surface-variant">{row.phone}</div>}
                                    </td>
                                    <td className="p-4 text-xs font-mono">
                                        {new Date(row.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            row.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {row.isVerified ? 'ACTIVE' : 'SUSPENDED'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(row.id)}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                                row.isVerified ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {row.isVerified ? 'Suspend Account' : 'Activate Account'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ONBOARD STAFF MODAL WITH WHATSAPP LINK */}
            {showOnboardModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-2xl font-bold text-on-surface">Onboard New Hospital Staff</h3>
                            <button onClick={() => setShowOnboardModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        {!createdStaffData ? (
                            <form onSubmit={handleCreateStaff} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Full Name *</label>
                                    <input type="text" required value={onboardForm.name} onChange={e => setOnboardForm({...onboardForm, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Email Address *</label>
                                    <input type="email" required value={onboardForm.email} onChange={e => setOnboardForm({...onboardForm, email: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Mobile Number (for WhatsApp Credential Sharing)</label>
                                    <input type="tel" placeholder="+91 9876543210" value={onboardForm.phone} onChange={e => setOnboardForm({...onboardForm, phone: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Assign Hospital Role *</label>
                                    <select value={onboardForm.role} onChange={e => setOnboardForm({...onboardForm, role: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold text-blue-900">
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="NURSE">Nurse</option>
                                        <option value="LAB_TECHNICIAN">Lab Technician</option>
                                        <option value="PHARMACY">Pharmacy</option>
                                        <option value="ACCOUNTS">Accounts</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>

                                {onboardForm.role === 'DOCTOR' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Specialization</label>
                                            <input type="text" value={onboardForm.specialization} onChange={e => setOnboardForm({...onboardForm, specialization: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Consultation Fee (₹)</label>
                                            <input type="number" value={onboardForm.consultationFee} onChange={e => setOnboardForm({...onboardForm, consultationFee: e.target.value})} className="w-full border p-3 rounded-xl text-sm font-mono" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowOnboardModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                    <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700">Onboard & Generate Credentials</button>
                                </div>
                            </form>
                        ) : (
                            /* SUCCESS ONBOARDING & WHATSAPP SHARE SCREEN */
                            <div className="space-y-5">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 font-mono">
                                    <div className="font-bold text-emerald-950 text-sm">✅ Account Created Successfully!</div>
                                    <div>📧 <strong>Email:</strong> {createdStaffData.user?.email}</div>
                                    <div>🔑 <strong>Auto-Generated Password:</strong> <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{createdStaffData.rawPassword}</span></div>
                                    <div>👤 <strong>Role:</strong> {createdStaffData.user?.role}</div>
                                </div>

                                {createdStaffData.whatsappLink && (
                                    <a
                                        href={createdStaffData.whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                                    >
                                        💬 Share Credentials via WhatsApp
                                    </a>
                                )}

                                <button onClick={() => setShowOnboardModal(false)} className="w-full border p-3 rounded-xl font-bold text-xs">Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminStaff;
