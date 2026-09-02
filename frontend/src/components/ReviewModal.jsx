import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReviewModal = ({ appointment, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/api/reviews', {
                appointmentId: appointment.appointment_id,
                rating,
                comment
            });
            toast.success('Thank you for rating your doctor!');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 border border-outline-variant/30 relative">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div>
                    <h3 className="font-headline-md text-2xl font-bold text-on-surface">Rate Your Consultation</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        How was your visit with <span className="font-semibold text-primary">{appointment.doctor_name}</span>?
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating Picker */}
                    <div className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-low rounded-xl">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <span
                                        className={`material-symbols-outlined text-[32px] transition-colors ${
                                            (hoverRating || rating) >= star
                                            ? 'text-amber-500'
                                            : 'text-outline-variant'
                                        }`}
                                        style={{ fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                        <span className="font-label-md font-bold text-xs uppercase tracking-wider text-amber-600">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
                        </span>
                    </div>

                    {/* Optional Comment */}
                    <div>
                        <label className="block font-label-md font-bold text-on-surface mb-2">Comments (Optional)</label>
                        <textarea
                            rows="3"
                            placeholder="Share your experience with the doctor..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl p-3 text-on-surface font-body-md outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-label-md font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-label-md font-bold shadow-md hover:bg-primary-hover active:scale-95 transition-all"
                        >
                            {submitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
