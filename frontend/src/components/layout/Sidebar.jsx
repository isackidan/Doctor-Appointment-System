import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ links, title = "Lumina Health" }) => {
    return (
        <aside className="w-full h-full flex flex-col bg-surface border-r border-outline-variant/30">
            {/* Logo Area */}
            <div className="flex items-center space-x-2 px-6 py-6">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                </div>
                <div>
                    <h1 className="font-headline-md text-xl font-extrabold text-primary tracking-tight">Lumina</h1>
                    <p className="font-label-sm text-xs text-on-surface-variant opacity-70">{title}</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2 pt-6 px-4">
                {links.map((link, index) => {
                    const iconName = link.icon;
                    return (
                        <NavLink
                            key={index}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg font-label-md transition-all active:scale-[0.98] ${
                                    isActive
                                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                                        : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span 
                                        className="material-symbols-outlined" 
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {iconName}
                                    </span>
                                    <span>{link.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-outline-variant/30 pt-4 pb-6 space-y-1 px-4">
                <a className="flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all font-label-md cursor-pointer">
                    <span className="material-symbols-outlined">help</span>
                    <span>Help Center</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
