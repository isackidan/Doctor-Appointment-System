import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[44px]">gpp_bad</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-on-surface mb-2">403 - Access Denied</h1>
            <p className="font-body-lg text-on-surface-variant max-w-md mb-8">
                Your hospital role does not have authorization to access this module or resource. Please contact your Super Admin if you believe this is an error.
            </p>
            <Link
                to="/login"
                className="bg-primary text-white px-6 py-3 rounded-xl font-label-md font-bold shadow-md hover:bg-primary-hover transition-all"
            >
                Return to Portal Sign In
            </Link>
        </div>
    );
};

export default UnauthorizedPage;
