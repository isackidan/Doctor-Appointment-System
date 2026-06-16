import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const DoctorPrescription = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ medication_details: '', notes: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post(`/doctor/appointment/${appointmentId}/prescription`, formData);
            toast.success('Prescription added successfully! Redirecting...');
            setTimeout(() => navigate('/doctor/dashboard'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add prescription.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Write Prescription</h2>
                <p className="text-sm text-gray-500 mt-1">Provide medication details and notes to complete the appointment.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medication Details <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                            placeholder="e.g., Paracetamol 500mg - 2 times a day for 3 days"
                            value={formData.medication_details}
                            onChange={(e) => setFormData({...formData, medication_details: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes
                        </label>
                        <textarea 
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                            placeholder="e.g., Drink plenty of warm water..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate('/doctor/dashboard')} 
                            className="w-full sm:w-1/3"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full sm:w-2/3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit & Complete'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default DoctorPrescription;