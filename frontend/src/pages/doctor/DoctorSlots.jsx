import React, { useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const todayDate = new Date().toISOString().split('T')[0];

const DoctorSlots = () => {
    const [formData, setFormData] = useState({
        slot_date: '',
        start_time: '',
        end_time: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.slot_date === todayDate) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (formData.start_time <= currentTime) {
                toast.error('Cannot create slots in the past time for today.');
                setIsLoading(false);
                return;
            }
        }

        try {
            const payload = {
                slot_date: formData.slot_date,
                start_time: `${formData.start_time}:00`,
                end_time: `${formData.end_time}:00`
            };

            await api.post('/doctor/slots', payload);
            toast.success('Slot added successfully!');
            setFormData({ slot_date: '', start_time: '', end_time: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add slot.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage Availability</h2>
                <p className="text-sm text-gray-500 mt-1">Add new time slots for patient appointments.</p>
            </div>

            <Card>
                <form onSubmit={handleAddSlot} className="space-y-6">
                    <Input
                        label="Select Date"
                        type="date"
                        name="slot_date"
                        required
                        min={todayDate}
                        value={formData.slot_date}
                        onChange={handleChange}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            name="start_time"
                            required
                            min={formData.slot_date === todayDate ? new Date().toTimeString().slice(0, 5) : undefined}
                            value={formData.start_time}
                            onChange={handleChange}
                        />
                        <Input
                            label="End Time"
                            type="time"
                            name="end_time"
                            required
                            value={formData.end_time}
                            onChange={handleChange}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-2.5"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding Slot...' : 'Add Slot'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default DoctorSlots;