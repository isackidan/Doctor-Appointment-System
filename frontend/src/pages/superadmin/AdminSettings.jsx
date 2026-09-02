import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [departments, setDepartments] = useState([]);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    const [addingDept, setAddingDept] = useState(false);

    // Change Password
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        try {
            setAddingDept(true);
            await api.post('/admin/departments', {
                name: newDeptName.trim(),
                description: newDeptDesc.trim() || undefined
            });
            toast.success(`Department "${newDeptName}" added!`);
            setNewDeptName('');
            setNewDeptDesc('');
            fetchDepartments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add department');
        } finally {
            setAddingDept(false);
        }
    };

    const handleDeleteDept = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove "${name}" department?`)) return;
        try {
            await api.delete(`/admin/departments/${id}`);
            toast.success('Department removed');
            fetchDepartments();
        } catch (err) {
            toast.error('Failed to remove department');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setUpdatingPassword(true);
            await api.put('/patient/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Super Admin password changed!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-on-surface">Hospital & System Settings</h1>
                <p className="text-xs text-on-surface-variant mt-0.5">Manage hospital profile, departments directory, roles permissions, and admin security.</p>
            </div>

            {/* 1. Hospital Profile */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="material-symbols-outlined text-blue-700">domain</span>
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Hospital Profile & Identity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-on-surface-variant font-bold block mb-1">Hospital Name</span>
                        <input
                            type="text"
                            readOnly
                            value="Lumina Health & Research Hospital"
                            className="w-full px-3 py-2 bg-surface-container rounded-xl font-bold text-on-surface border border-outline-variant/20"
                        />
                    </div>
                    <div>
                        <span className="text-on-surface-variant font-bold block mb-1">NABH / Clinical Reg #</span>
                        <input
                            type="text"
                            readOnly
                            value="HOSP-TN-2026-9812"
                            className="w-full px-3 py-2 bg-surface-container rounded-xl font-mono text-on-surface border border-outline-variant/20"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Clinical Departments Management */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-700">corporate_fare</span>
                        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Clinical Departments ({departments.length})</h3>
                    </div>
                </div>

                {/* Add Dept Form */}
                <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-2 text-xs">
                    <input
                        type="text"
                        required
                        placeholder="Department Name (e.g. Cardiology)"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                    <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                    <button
                        type="submit"
                        disabled={addingDept}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Department
                    </button>
                </form>

                {/* Departments List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {departments.map((d) => (
                        <div key={d.id} className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-on-surface">{d.name}</h4>
                                <p className="text-[10px] text-on-surface-variant">{d.doctorCount} Doctors • {d.appointmentCount} Visits</p>
                            </div>
                            <button
                                onClick={() => handleDeleteDept(d.id, d.name)}
                                className="p-1 text-on-surface-variant hover:text-rose-600 transition"
                                title="Delete Department"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Change Super Admin Password */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="material-symbols-outlined text-blue-700">lock_reset</span>
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Super Admin Security & Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3 text-xs max-w-md">
                    <div>
                        <label className="font-bold block mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">New Super Admin Password</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={updatingPassword}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                        {updatingPassword ? 'Updating...' : 'Change Super Admin Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
