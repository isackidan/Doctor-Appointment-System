import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const DoctorCard = ({ doctor }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-t-4 border-t-primary p-0 overflow-hidden">
            <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
                        {doctor.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{doctor.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{doctor.specialization}</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mt-4 space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600 font-medium">Consultation Fee:</span>
                        <span className="font-bold text-gray-800">₹{doctor.consultation_fee}</span>
                    </div>
                    {doctor.hospital_address && (
                        <div className="flex items-start gap-2 pt-1">
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 leading-tight">
                                {doctor.hospital_address}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="px-6 pb-6 pt-0 mt-auto">
                <Link to={`/user/book/${doctor.doctor_profile_id}`} className="block">
                    <Button variant="primary" className="w-full">
                        View Slots & Book
                    </Button>
                </Link>
            </div>
        </Card>
    );
};

export default DoctorCard;