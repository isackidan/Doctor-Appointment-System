import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout = ({ links, title }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar (Desktop Only) */}
            <div className="hidden md:flex flex-col w-64 bg-surface z-40">
                <Sidebar links={links} title={title} />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden w-full relative pb-16 md:pb-0">
                {/* Header */}
                <Header title={title} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
                    <Outlet />
                </main>
            </div>

            {/* Bottom Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/30 flex justify-around items-center h-16 z-50 px-2 pb-safe">
                {links.map((link, index) => {
                    const iconName = link.icon;
                    return (
                        <NavLink
                            key={index}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                                    isActive ? 'text-primary' : 'text-on-surface-variant'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span 
                                        className={`material-symbols-outlined text-[24px] ${isActive ? 'bg-primary-container text-on-primary-container px-4 py-1 rounded-full' : ''}`}
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {iconName}
                                    </span>
                                    <span className="text-[10px] font-label-sm font-medium">{link.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardLayout;
