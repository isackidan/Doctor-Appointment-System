import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DoctorCard from '../../components/DoctorCard';

const FindSpecialists = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctor/list');
                setDoctors(response.data.data);
            } catch (err) {
                console.error("Error fetching doctors:", err);
                setError('Failed to load doctors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filters = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Pediatrician'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant font-label-md">Loading specialists...</p>
        </div>
    );
    if (error) return (
        <div className="p-10 text-center bg-error-container text-on-error-container rounded-2xl m-4 font-label-md">
            {error}
        </div>
    );

    const filteredDoctors = doctors.filter(doc => {
        const matchesFilter = activeFilter === 'All' || doc.specialization.toLowerCase().includes(activeFilter.toLowerCase());
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans relative animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div>
                <h2 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Find a Specialist</h2>
                <p className="text-on-surface-variant text-base mt-2">Search through 2,500+ verified medical professionals</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 flex items-center bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
                    <input 
                        type="text" 
                        placeholder="Symptoms, doctors, or clinics" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-on-surface placeholder:text-outline font-body-md"
                    />
                </div>
                <button className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 shadow-sm text-on-surface-variant hover:text-primary hover:bg-white transition-colors flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">tune</span>
                </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {filters.map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap transition-all border ${
                            activeFilter === filter 
                                ? 'bg-primary text-on-primary border-primary shadow-md' 
                                : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Doctor Cards List */}
            {filteredDoctors.length === 0 ? (
                <div className="text-center bg-white/50 backdrop-blur-md rounded-2xl text-on-surface-variant py-16 border border-outline-variant/30 shadow-sm font-label-md flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[48px] text-outline opacity-50">search_off</span>
                    No doctors found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <DoctorCard key={doctor.doctor_profile_id} doctor={doctor} />
                    ))}
                </div>
            )}

            {/* Floating Filter Results Pill */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
                <button className="bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full font-label-md font-semibold shadow-xl flex items-center gap-2 hover:bg-black transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter Results
                </button>
            </div>
        </div>
    );
};

export default FindSpecialists;
