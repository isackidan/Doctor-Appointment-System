import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[44px]">search_off</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-on-surface mb-2">404 - Page Not Found</h1>
            <p className="font-body-lg text-on-surface-variant max-w-md mb-8">
                The requested URL or clinical resource could not be found on this Lumina Health ERP server.
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

export default NotFoundPage;
