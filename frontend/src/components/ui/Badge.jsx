import React from 'react';

const Badge = ({ children, status = 'default', className = '' }) => {
    const statuses = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        primary: "bg-[#f5ead9] text-[#c09b62]", // Light golden background
        default: "bg-gray-100 text-gray-800",
    };

    const variantClass = statuses[status] || statuses.default;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
