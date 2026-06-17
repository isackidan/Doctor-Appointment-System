import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/admin/all-doctors');
                setDoctors(response.data.data);
            } catch (error) {
                console.error("Error fetching doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/approve-doctor/${userId}`);
            setDoctors(doctors.map(doc => doc.user_id === userId ? { ...doc, is_approved: true } : doc));
            toast.success("Doctor Approved Successfully!");
        } catch (error) {
            toast.error("Failed to approve doctor.");
        }
    };

    const columns = [
        {
            header: 'Doctor Details',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-800">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                </div>
            )
        },
        {
            header: 'Specialization & Address',
            render: (row) => (
                <div>
                    <span className="text-primary font-medium block">{row.specialization}</span>
                    <span className="text-xs text-gray-500 block mt-0.5">{row.hospital_address || 'Not provided'}</span>
                </div>
            )
        },
        {
            header: 'Certificate',
            render: (row) => (
                <a 
                    href={`http://localhost:5000${row.certificate_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                    View Document
                </a>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${row.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {row.is_approved ? 'Approved' : 'Pending'}
                </span>
            )
        },
        {
            header: 'Action',
            render: (row) => (
                !row.is_approved ? (
                    <Button 
                        variant="primary" 
                        className="py-1 px-3 text-xs"
                        onClick={() => handleApprove(row.user_id)}
                    >
                        Approve
                    </Button>
                ) : (
                    <span className="text-gray-400 text-xs font-medium">No Action</span>
                )
            )
        }
    ];

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading doctors list...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">All Doctors</h2>
                <p className="text-sm text-gray-500 mt-1">Manage doctor registrations and statuses.</p>
            </div>

            <Card className="p-0 overflow-hidden">
                <Table columns={columns} data={doctors} />
            </Card>
        </div>
    );
};

export default AdminDoctors;