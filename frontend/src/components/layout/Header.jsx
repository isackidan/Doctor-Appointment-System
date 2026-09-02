import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/themeConfig';

const Header = ({ title, onMenuClick }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const theme = getRoleTheme(user?.role);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-18 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-2xs">
            {/* Left side: Mobile Menu + Desktop Title / Greeting */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors flex items-center justify-center"
                    aria-label="Open Navigation Menu"
                >
                    <span className="material-symbols-outlined text-[26px]">menu</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className={`md:hidden text-base font-display font-black tracking-tight ${theme.textPrimary}`}>
                        {title || 'Lumina ERP'}
                    </span>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-display text-lg font-bold text-on-surface">Welcome, {user?.name || 'User'}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${theme.bgBadge} flex items-center gap-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.badgeDot}`}></span>
                                {theme.roleName}
                            </span>
                        </div>
                        <p className="font-body-sm text-[11px] text-on-surface-variant font-medium">Lumina Clinical Enterprise Operating System</p>
                    </div>
                </div>
            </div>

            {/* Right side search, status, notifications & profile */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Live System Indicator */}
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Hospital ERP Live</span>
                </div>

                {/* Quick Search */}
                <div className="hidden sm:flex items-center bg-surface-container-low hover:bg-surface-container rounded-xl px-3.5 py-2 border border-outline-variant/30 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                    <input 
                        type="text" 
                        placeholder="Search patient, EHR, records..." 
                        className="bg-transparent border-none text-xs font-body-sm text-on-surface placeholder:text-outline w-44 md:w-56 outline-none pl-2"
                    />
                </div>

                {/* Notification Bell */}
                <button 
                    className="text-on-surface-variant hover:text-on-surface relative p-2 transition-colors hover:bg-surface-container-high rounded-xl"
                    title="Notifications"
                >
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </button>
                
                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/30">
                    <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 ${theme.borderAccent} p-[1.5px] shadow-2xs`}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=${theme.avatarBg}&color=${theme.avatarColor}&bold=true`} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="hidden lg:block text-left">
                        <div className="text-xs font-bold text-on-surface leading-tight truncate max-w-[120px]">{user?.name?.split(' ')[0]}</div>
                        <div className="text-[10px] text-on-surface-variant font-medium leading-none truncate">{user?.email}</div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-xl hover:bg-error-container/20"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
