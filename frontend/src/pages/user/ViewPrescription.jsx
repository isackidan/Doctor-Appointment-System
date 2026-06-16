import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ViewPrescription = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                const response = await api.get(`/appointments/${appointmentId}/prescription`);
                setPrescription(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load prescription');
            } finally {
                setLoading(false);
            }
        };
        fetchPrescription();
    }, [appointmentId]);

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading prescription...</div>;
    
    if (error) return (
        <div className="max-w-2xl mx-auto mt-6">
            <Card>
                <div className="text-center py-6">
                    <div className="text-red-500 font-medium mb-4">{error}</div>
                    <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </Card>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Medical Prescription</h2>
                <p className="text-sm text-gray-500 mt-1">Review the details and notes from your consultation.</p>
            </div>

            <Card className="border-t-4 border-t-primary">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
                        {new Date(prescription.created_at).toLocaleDateString()}
                    </span>
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="text-primary font-bold text-lg">Rx</span> Medication Details
                    </h4>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {prescription.medication_details}
                    </div>
                </div>

                {prescription.notes && (
                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                            Doctor's Notes
                        </h4>
                        <div className="bg-[#fcf8f2] p-5 rounded-lg border border-[#f5ead9] whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {prescription.notes}
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <Button 
                        variant="primary"
                        onClick={() => navigate('/user/appointments')} 
                    >
                        Back to Appointments
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ViewPrescription;