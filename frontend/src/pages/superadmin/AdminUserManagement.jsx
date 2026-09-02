import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);

    // Create User Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'DOCTOR',
        specialization: '',
        consultationFee: 500,
        hospitalAddress: 'Lumina Main Hospital',
        departmentId: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Created User Credentials Modal
    const [createdCredential, setCreatedCredential] = useState(null);

    // Reset Password Modal
    const [resettingUser, setResettingUser] = useState(null);
    const [customPassword, setCustomPassword] = useState('');

    const rolesList = [
        'ALL',
        'DOCTOR',
        'NURSE',
        'RECEPTIONIST',
        'LAB_TECHNICIAN',
        'PHARMACY',
        'ACCOUNTS',
        'PATIENT',
        'SUPER_ADMIN'
    ];

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (roleFilter !== 'ALL') params.role = roleFilter;
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/admin/users', { params });
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data.data);
            if (res.data.data.length > 0) {
                setFormData(prev => ({ ...prev, departmentId: res.data.data[0].id }));
            }
        } catch (err) {}
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await api.post('/admin/users', formData);
            toast.success('User account created!');
            setShowCreateModal(false);
            setCreatedCredential(res.data.data);
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const res = await api.put(`/admin/users/${userId}/toggle-status`);
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resettingUser) return;

        try {
            const res = await api.put(`/admin/users/${resettingUser.id}/reset-password`, {
                password: customPassword || undefined
            });
            toast.success('Password reset successfully!');
            setCreatedCredential({
                user: resettingUser,
                rawPassword: res.data.data.newPassword,
                messageText: `Your password for Lumina ERP has been reset to: ${res.data.data.newPassword}`
            });
            setResettingUser(null);
            setCustomPassword('');
        } catch (err) {
            toast.error('Failed to reset password');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Credentials copied to clipboard!');
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">User & Staff Management</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Control hospital roles, onboard new staff, and manage credentials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Add New User / Staff
                    </button>
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm space-y-4">
                {/* Role Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {rolesList.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                roleFilter === r
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                            }`}
                        >
                            {r.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
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

            {/* Users Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">User Name</th>
                                <th className="p-4">Email / Login ID</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Assigned Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading directory...</span>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-on-surface-variant">
                                        No users found matching the criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 font-bold text-on-surface">
                                            {u.name}
                                            {u.doctor && (
                                                <div className="text-[10px] text-on-surface-variant font-normal">
                                                    {u.doctor.specialization} • {u.doctor.department?.name || 'General'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-on-surface font-mono">{u.email}</td>
                                        <td className="p-4 text-on-surface-variant">{u.phone || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-container border border-outline-variant/30 text-on-surface">
                                                {u.role.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                u.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {u.isVerified ? 'ACTIVE' : 'SUSPENDED'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-on-surface-variant">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                onClick={() => setResettingUser(u)}
                                                className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold text-on-surface border border-outline-variant/20 transition"
                                                title="Reset Password"
                                            >
                                                Reset Pass
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(u.id)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition text-white ${
                                                    u.isVerified ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                                }`}
                                            >
                                                {u.isVerified ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-lg w-full border border-outline-variant/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-base font-bold text-on-surface">Create New Hospital User / Staff</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Select User Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                                >
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="NURSE">Nurse</option>
                                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                                    <option value="PHARMACY">Pharmacy Staff</option>
                                    <option value="ACCOUNTS">Accounts / Billing</option>
                                    <option value="PATIENT">Patient</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold block mb-1 text-on-surface">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Dr. Ramesh Gupta"
                                        className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold block mb-1 text-on-surface">Email (Username)</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@hospital.com"
                                        className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            {/* Doctor Specific Fields */}
                            {formData.role === 'DOCTOR' && (
                                <div className="p-3 bg-surface-container rounded-xl space-y-3 border border-outline-variant/20">
                                    <p className="font-bold text-[11px] uppercase tracking-wider text-blue-700">Doctor Practice Setup</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block mb-1 text-on-surface-variant font-bold">Department</label>
                                            <select
                                                value={formData.departmentId}
                                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                                className="w-full px-2.5 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-xs"
                                            >
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-on-surface-variant font-bold">Specialization</label>
                                            <input
                                                type="text"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                placeholder="e.g. Cardiology"
                                                className="w-full px-2.5 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-on-surface-variant font-bold">Consultation Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.consultationFee}
                                            onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Generating Account...' : 'Create & Generate Credentials'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Created Credentials Modal */}
            {createdCredential && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-emerald-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                                <h3 className="text-base font-bold text-on-surface">User Account Credentials</h3>
                            </div>
                            <button onClick={() => setCreatedCredential(null)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <p className="text-xs text-on-surface-variant">Share these login credentials with the user immediately:</p>

                        <div className="p-4 bg-surface-container rounded-xl space-y-2 text-xs font-mono">
                            <div>
                                <span className="text-on-surface-variant block font-sans text-[10px]">User Role:</span>
                                <span className="font-bold text-blue-700">{createdCredential.user?.role}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block font-sans text-[10px]">Email / Username:</span>
                                <span className="font-bold text-on-surface">{createdCredential.user?.email}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block font-sans text-[10px]">Initial Password:</span>
                                <span className="font-bold text-emerald-700 text-sm">{createdCredential.rawPassword}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={() => copyToClipboard(`Email: ${createdCredential.user?.email}\nPassword: ${createdCredential.rawPassword}\nPortal: http://localhost:5173/login`)}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                Copy Credentials
                            </button>
                            {createdCredential.whatsappLink && (
                                <a
                                    href={createdCredential.whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Send via WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resettingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                            <h3 className="text-base font-bold text-on-surface">Reset Password: {resettingUser.name}</h3>
                            <button onClick={() => setResettingUser(null)} className="text-on-surface-variant hover:text-rose-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold block mb-1 text-on-surface">Custom New Password (Optional)</label>
                                <input
                                    type="text"
                                    value={customPassword}
                                    onChange={(e) => setCustomPassword(e.target.value)}
                                    placeholder="Leave blank to auto-generate password"
                                    className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-blue-600 font-mono"
                                />
                                <span className="text-[10px] text-on-surface-variant">If left blank, system generates a secure random password.</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResettingUser(null)}
                                    className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl font-bold text-on-surface hover:bg-surface-container transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
                                >
                                    Confirm Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
