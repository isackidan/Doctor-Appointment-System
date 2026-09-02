import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperAdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/departments');
            setDepartments(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/departments', form);
            toast.success('Department created successfully!');
            setShowModal(false);
            setForm({ name: '', description: '' });
            fetchDepartments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create department');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Hospital Departments</h2>
                    <p className="font-body-lg text-on-surface-variant mt-1">Manage clinical departments, assigned doctors, and appointment volume.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Add New Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl text-on-surface">🏥 {dept.name}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                                {dept.doctorCount || 0} Doctors
                            </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{dept.description || 'Clinical Department'}</p>
                        <div className="border-t pt-3 flex justify-between text-xs font-mono">
                            <span className="text-on-surface-variant">Total Appointments:</span>
                            <span className="font-extrabold text-blue-700">{dept.appointmentCount || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD DEPARTMENT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-2xl font-bold text-on-surface">Add New Department</h3>
                            <button onClick={() => setShowModal(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleCreateDept} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Department Name *</label>
                                <input type="text" required placeholder="e.g. Cardiology" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Description</label>
                                <textarea rows="3" placeholder="Department clinical scope..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-3 rounded-xl text-sm"></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border p-3 rounded-xl text-sm font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700">Create Department</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDepartments;
