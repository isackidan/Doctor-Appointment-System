import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
    // Generate a random high rating for demo purposes
    const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);
    
    // Default images for doctors (simulating a high quality medical app)
    const doctorImage = `https://ui-avatars.com/api/?name=${doctor.name}&background=EFF6FF&color=1A56DB&size=120`;

    return (
        <div className="bg-white rounded-[16px] p-6 custom-shadow border border-outline-variant/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6">
            {/* Avatar & Availability */}
            <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-surface-container-high shadow-sm">
                    <img 
                        src={doctorImage} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-primary/90 text-white text-[10px] font-bold text-center py-0.5 backdrop-blur-sm">
                        TOP RATED
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-tertiary-fixed/30 text-tertiary-fixed-variant px-3 py-1 rounded-full border border-tertiary/20">
                    <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Available</span>
                </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h3 className="text-xl font-headline-md font-bold text-on-surface line-clamp-1">{doctor.name}</h3>
                        <p className="text-sm font-label-md text-primary mt-0.5">{doctor.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold text-on-surface">{rating}</span>
                    </div>
                </div>
                
                <p className="text-sm font-body-sm text-on-surface-variant line-clamp-1 mb-4 flex items-center gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {doctor.hospital_address || 'General Hospital'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-auto border-t border-outline-variant/20 pt-4">
                    <div>
                        <p className="text-[11px] font-label-sm text-outline uppercase tracking-wider mb-1">Consultation</p>
                        <p className="text-sm font-headline-sm font-bold text-on-surface">₹{doctor.consultation_fee}</p>
                    </div>
                    <div className="text-right">
                        <Link to={`/user/book/${doctor.doctor_profile_id}`}>
                            <button className="bg-primary text-white px-6 py-2 rounded-xl font-label-md font-bold hover:bg-primary-hover shadow-md hover:shadow-lg transition-all active:scale-95">
                                Book Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;