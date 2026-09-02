import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout = ({ links, title }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar (Desktop Only) */}
            <div className="hidden md:flex flex-col w-64 bg-surface z-40 shadow-sm">
                <Sidebar links={links} title={title} />
            </div>

            {/* Mobile Sidebar Backdrop */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar Offcanvas */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-surface z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar links={links} title={title} onLinkClick={() => setIsMobileSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden w-full relative">
                {/* Header */}
                <Header title={title} onMenuClick={() => setIsMobileSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
