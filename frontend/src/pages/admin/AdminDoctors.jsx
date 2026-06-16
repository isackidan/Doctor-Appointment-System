import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingDoctors = async () => {
            try {
                const response = await api.get('/admin/pending-doctors');
                setPendingDoctors(response.data.data);
            } catch (error) {
                console.error("Error fetching doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingDoctors();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/approve-doctor/${userId}`);
            setPendingDoctors(pendingDoctors.filter(doc => doc.user_id !== userId));
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
                    href={row.certificate_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
                >
                    View Document
                </a>
            )
        },
        {
            header: 'Action',
            render: (row) => (
                <Button 
                    variant="primary" 
                    className="py-1 px-3 text-xs"
                    onClick={() => handleApprove(row.user_id)}
                >
                    Approve
                </Button>
            )
        }
    ];

    if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading pending approvals...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
                <p className="text-sm text-gray-500 mt-1">Review and approve new doctor registrations.</p>
            </div>

            <Card className="p-0 overflow-hidden">
                <Table columns={columns} data={pendingDoctors} />
            </Card>
        </div>
    );
};

export default AdminDoctors;