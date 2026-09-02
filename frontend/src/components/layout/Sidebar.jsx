import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/themeConfig';

const Sidebar = ({ links, title = "Lumina Health", onLinkClick }) => {
    const { user, logout } = useContext(AuthContext);
    const theme = getRoleTheme(user?.role);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-full h-full flex flex-col bg-white border-r border-outline-variant/30 select-none shadow-xs">
            {/* Logo Header */}
            <div className="flex items-center space-x-3 px-6 py-5 border-b border-outline-variant/20">
                <div className={`w-10 h-10 rounded-xl ${theme.bgLogo} flex items-center justify-center transition-transform hover:scale-105`}>
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                </div>
                <div className="overflow-hidden">
                    <h1 className={`font-display text-lg font-black ${theme.textPrimary} tracking-tight leading-none`}>Lumina ERP</h1>
                    <p className="font-body-sm text-[11px] text-on-surface-variant font-semibold truncate mt-0.5">{title}</p>
                </div>
            </div>

            {/* Role Badge Chip */}
            <div className="px-5 pt-3.5 pb-1.5">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${theme.bgBadge} w-full shadow-2xs`}>
                    <span className={`w-2 h-2 rounded-full ${theme.badgeDot} animate-ping`}></span>
                    <span className="truncate">{theme.roleName} Workspace</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1.5 pt-3 px-3.5 overflow-y-auto">
                {links.map((link, index) => {
                    const iconName = link.icon;
                    return (
                        <NavLink
                            key={index}
                            to={link.to}
                            onClick={onLinkClick}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-label-md text-xs font-bold transition-all duration-200 group ${
                                    isActive
                                        ? `${theme.bgActive} scale-[1.01]`
                                        : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span 
                                        className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-on-surface-variant'}`} 
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {iconName}
                                    </span>
                                    <span className="truncate">{link.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Support & Logout Section */}
            <div className="mt-auto border-t border-outline-variant/20 pt-3 pb-5 space-y-1 px-3.5 bg-surface-container-lowest/50">
                <a className="flex items-center space-x-3 px-3.5 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-xs font-semibold cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">help_center</span>
                    <span>Help & Documentation</span>
                </a>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3.5 py-2 text-error hover:bg-error-container/20 rounded-xl transition-all text-xs font-bold cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
