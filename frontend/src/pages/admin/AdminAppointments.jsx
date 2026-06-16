import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/admin/appointments');
                setAppointments(response.data.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter((appt) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            appt.patient_name.toLowerCase().includes(searchLower) ||
            appt.doctor_name.toLowerCase().includes(searchLower) ||
            appt.status.toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            header: 'Patient',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-800">{row.patient_name}</div>
                    <div className="text-xs text-gray-500">{row.patient_email}</div>
                </div>
            )
        },
        {
            header: 'Doctor',
            render: (row) => <span className="font-semibold text-primary">{row.doctor_name}</span>
        },
        {
            header: 'Date & Time',
            render: (row) => {
                const date = new Date(row.slot_date).toLocaleDateString();
                const time = `${row.start_time.slice(0,5)} - ${row.end_time.slice(0,5)}`;
                return (
                    <div>
                        <div className="text-gray-800">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                    </div>
                );
            }
        },
        {
            header: 'Fee',
            render: (row) => <span className="font-semibold text-gray-700">₹{row.total_fee}</span>
        },
        {
            header: 'Status',
            render: (row) => {
                let statusVariant = 'default';
                if (row.status === 'BOOKED') statusVariant = 'primary';
                else if (row.status === 'COMPLETED') statusVariant = 'success';
                else if (row.status === 'CANCELLED') statusVariant = 'danger';

                return <Badge status={statusVariant}>{row.status}</Badge>;
            }
        }
    ];

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading appointments...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Platform Appointments</h2>
                    <p className="text-sm text-gray-500">Manage all appointments across the platform.</p>
                </div>
                
                <Input 
                    type="text" 
                    placeholder="Search patient, doctor..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72"
                />
            </div>

            <Card className="p-0 overflow-hidden">
                <Table columns={columns} data={filteredAppointments} />
            </Card>
        </div>
    );
};

export default AdminAppointments;