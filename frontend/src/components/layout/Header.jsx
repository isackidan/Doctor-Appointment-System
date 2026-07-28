import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ title }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
            {/* Left side: Mobile Title / Desktop Greeting */}
            <div className="flex items-center">
                <span className="md:hidden text-lg font-headline-md font-bold text-primary tracking-tight">
                    {title || 'Lumina Health'}
                </span>
                <div className="hidden md:block">
                    <h2 className="font-headline-md text-xl font-bold text-on-surface">Hello, {user?.name?.split(' ')[0] || 'User'}!</h2>
                    <p className="font-body-sm text-sm text-on-surface-variant">Here is your daily health summary</p>
                </div>
            </div>

            {/* Right side icons & profile */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/20 shadow-sm hover:shadow transition-shadow">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none focus:ring-0 text-sm font-body-sm text-on-surface placeholder:text-outline w-40 outline-none"
                    />
                </div>

                <button className="text-on-surface-variant hover:text-primary relative p-2 transition-colors hover:bg-primary/5 rounded-full">
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary-container p-[2px]">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=EFF6FF&color=1A56DB`} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="hidden md:flex text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error/5"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
