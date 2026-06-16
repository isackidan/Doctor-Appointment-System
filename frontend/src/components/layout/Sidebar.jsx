import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

const Sidebar = ({ links, title = "DocConnect", isOpen, closeMenu }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMenu}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
                    <span className="text-xl font-bold text-gray-800 tracking-tight">
                        {title}
                    </span>
                    <button onClick={closeMenu} className="md:hidden text-gray-500 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {links.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={index}
                                    to={link.to}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-[var(--color-sidebar-active)] text-primary'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {Icon && <Icon className="w-5 h-5" />}
                                    {link.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
