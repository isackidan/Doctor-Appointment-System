import React from 'react';

const Card = ({ children, className = '', title, action }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                    {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div>
                {children}
            </div>
        </div>
    );
};

export default Card;
