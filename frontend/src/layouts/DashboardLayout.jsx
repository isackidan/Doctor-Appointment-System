import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout = ({ links, title }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-secondary)]">
            {/* Sidebar */}
            <Sidebar links={links} title={title} isOpen={isMobileMenuOpen} closeMenu={closeMenu} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden w-full">
                {/* Header */}
                <Header toggleMenu={toggleMenu} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
