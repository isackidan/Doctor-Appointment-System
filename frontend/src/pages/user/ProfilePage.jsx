import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, login } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        patientCode: '',
        email: '',
        phone: '',
        dob: '',
        age: '',
        gender: '',
        bloodGroup: '',
        emergencyContact: '',
        allergies: '',
        medicalHistory: '',
        address: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/profile');
            const p = res.data.data;
            setProfile({
                name: p.name || '',
                patientCode: p.patientCode || 'PAT-ID',
                email: p.email || '',
                phone: p.phone || '',
                dob: p.dob ? new Date(p.dob).toISOString().slice(0, 10) : '',
                age: p.age || '',
                gender: p.gender || 'Male',
                bloodGroup: p.bloodGroup || 'O+',
                emergencyContact: p.emergencyContact || '',
                allergies: p.allergies || '',
                medicalHistory: p.medicalHistory || '',
                address: p.address || '',
                city: p.city || '',
                state: p.state || ''
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await api.put('/patient/profile', profile);
            toast.success('Patient profile updated successfully!');

            // Sync with AuthContext & localStorage
            const token = localStorage.getItem('token');
            if (token && user) {
                login(token, {
                    ...user,
                    name: profile.name,
                    phone: profile.phone
                });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-3xl shadow-sm">
                        <span className="material-symbols-outlined text-[36px]">badge</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-on-surface">{profile.name}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                                {profile.patientCode}
                            </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Email: <span className="font-bold text-on-surface">{profile.email}</span> • Role: <span className="font-bold text-cyan-700 uppercase">Patient</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
                <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs">
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                        1. Personal & Contact Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Full Name</label>
                            <input
                                type="text"
                                required
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Patient ID (Permanent)</label>
                            <input
                                type="text"
                                disabled
                                value={profile.patientCode}
                                className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs font-mono font-bold text-on-surface-variant cursor-not-allowed opacity-80"
                            />
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Phone Number</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Email Address (Account Login)</label>
                            <input
                                type="email"
                                disabled
                                value={profile.email}
                                className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/30 rounded-xl text-xs text-on-surface-variant cursor-not-allowed opacity-80"
                            />
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Date of Birth</label>
                            <input
                                type="date"
                                value={profile.dob}
                                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Gender</label>
                            <select
                                value={profile.gender}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2 pt-4">
                        2. Medical & Emergency Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Blood Group</label>
                            <select
                                value={profile.bloodGroup}
                                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs font-bold text-cyan-800 focus:outline-none focus:border-cyan-600"
                            >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-on-surface">Emergency Contact Person & Phone</label>
                            <input
                                type="text"
                                value={profile.emergencyContact}
                                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                placeholder="e.g. John Doe (Brother) - +91 99887 76655"
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="font-bold block mb-1 text-on-surface">Known Drug / Food Allergies</label>
                            <input
                                type="text"
                                value={profile.allergies}
                                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (Leave blank if none)"
                                className="w-full px-3 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-xs text-rose-700 font-semibold focus:outline-none focus:border-cyan-600"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="font-bold block mb-1 text-on-surface">Medical History / Chronic Conditions</label>
                            <textarea
                                rows="2"
                                value={profile.medicalHistory}
                                onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
                                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma..."
                                className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-2 pt-4">
                        3. Residential Address
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-3">
                            <label className="font-bold block mb-1 text-on-surface">Street Address</label>
                            <input
                                type="text"
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                placeholder="House / Flat No, Street, Landmark"
                                className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>
                        <div>
                            <label className="font-bold block mb-1 text-on-surface">City</label>
                            <input
                                type="text"
                                value={profile.city}
                                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>
                        <div>
                            <label className="font-bold block mb-1 text-on-surface">State</label>
                            <input
                                type="text"
                                value={profile.state}
                                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-cyan-600"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
