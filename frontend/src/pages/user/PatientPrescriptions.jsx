import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/prescriptions');
            setPrescriptions(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">My Prescriptions</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">View your doctor prescribed medications, dosages, and medical instructions.</p>
                </div>
                <button
                    onClick={fetchPrescriptions}
                    className="p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high text-on-surface-variant transition"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Prescriptions List */}
            <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="p-4">Date</th>
                                <th className="p-4">Doctor</th>
                                <th className="p-4">Specialization</th>
                                <th className="p-4">Medicines Prescribed</th>
                                <th className="p-4">Dispensed</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-on-surface-variant">
                                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span>Loading prescriptions...</span>
                                    </td>
                                </tr>
                            ) : prescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">prescriptions</span>
                                        <p className="font-bold">No prescription records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                prescriptions.map((presc) => (
                                    <tr key={presc.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-4 text-on-surface font-bold">
                                            {new Date(presc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-on-surface">
                                            Dr. {presc.doctor?.user?.name}
                                        </td>
                                        <td className="p-4 text-on-surface-variant">
                                            {presc.doctor?.specialization || 'Consultant'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {presc.items?.map((item, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-surface-container rounded-md text-[10px] font-bold text-on-surface">
                                                        {item.medicineName} ({item.dosage})
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                presc.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {presc.dispensed ? 'Dispensed' : 'Pending Pharmacy'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedPrescription(presc)}
                                                className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition shadow-sm inline-flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                View Rx
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View & Print Prescription Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
                    <div className="bg-surface rounded-2xl max-w-2xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden print:shadow-none print:border-none print:w-full">
                        {/* Modal Header */}
                        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between print:hidden">
                            <h3 className="text-base font-bold text-on-surface">Doctor Prescription (Rx)</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-cyan-700 transition"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span> Print
                                </button>
                                <button
                                    onClick={() => setSelectedPrescription(null)}
                                    className="p-1 text-on-surface-variant hover:text-rose-600 transition"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Printable Prescription Content */}
                        <div className="p-8 space-y-6 text-on-surface">
                            <div className="text-center border-b border-outline-variant/30 pb-4">
                                <h2 className="text-2xl font-black text-cyan-800">Lumina Health & Research Hospital</h2>
                                <p className="text-xs text-on-surface-variant">Medical Prescription • Department of Clinical Care</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs border border-outline-variant/20 p-4 rounded-xl bg-surface-container-lowest">
                                <div>
                                    <p className="text-on-surface-variant">Doctor:</p>
                                    <p className="font-bold text-sm text-on-surface">Dr. {selectedPrescription.doctor?.user?.name}</p>
                                    <p className="text-on-surface-variant">{selectedPrescription.doctor?.specialization}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant">Prescription Date:</p>
                                    <p className="font-bold text-on-surface">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                                    <p className="text-on-surface-variant">Rx ID: #{selectedPrescription.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Medicines Table */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px] text-cyan-700">medication</span>
                                    Prescribed Medications
                                </h4>
                                <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-surface-container-lowest border-b font-bold text-on-surface-variant">
                                            <tr>
                                                <th className="p-3">#</th>
                                                <th className="p-3">Medicine Name</th>
                                                <th className="p-3">Dosage</th>
                                                <th className="p-3">Frequency</th>
                                                <th className="p-3">Duration</th>
                                                <th className="p-3 text-right">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/10 font-medium">
                                            {selectedPrescription.items?.map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                    <td className="p-3 text-on-surface-variant">{idx + 1}</td>
                                                    <td className="p-3 font-bold text-on-surface">{item.medicineName}</td>
                                                    <td className="p-3">{item.dosage}</td>
                                                    <td className="p-3 text-cyan-800 font-bold">{item.frequency}</td>
                                                    <td className="p-3">{item.durationDays} Days</td>
                                                    <td className="p-3 text-right font-bold">{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Doctor Notes */}
                            {selectedPrescription.notes && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-xs">
                                    <p className="font-bold text-on-surface mb-1">Doctor Advice / Dietary Instructions:</p>
                                    <p className="text-on-surface-variant">{selectedPrescription.notes}</p>
                                </div>
                            )}

                            {/* Signature */}
                            <div className="pt-8 border-t border-outline-variant/30 flex justify-between items-end text-xs">
                                <div>
                                    <p className="text-[10px] text-on-surface-variant">Take medications only as prescribed.</p>
                                    <p className="text-[10px] text-on-surface-variant">Digital Prescription valid at Lumina Pharmacy.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-36 border-b border-outline-variant/40 mb-1"></div>
                                    <p className="text-[10px] font-bold text-on-surface">Dr. {selectedPrescription.doctor?.user?.name}</p>
                                    <p className="text-[9px] text-on-surface-variant">Authorized Medical Practitioner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientPrescriptions;
