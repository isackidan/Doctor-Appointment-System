import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Search, Bell, LogOut, User, Menu } from 'lucide-react';

const Header = ({ toggleMenu }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
            {/* Left side: Hamburger (Mobile) + Search */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleMenu}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-primary focus:outline-none"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:flex items-center bg-gray-50 rounded-md px-3 py-1.5 w-64 border border-gray-200">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search Menu..." 
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                    />
                </div>
            </div>

            {/* Right side icons & profile */}
            <div className="flex items-center gap-2 md:gap-4">
                <button className="text-gray-500 hover:text-gray-700 relative p-2">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center gap-2 md:gap-3 md:ml-4 md:border-l border-gray-200 md:pl-4">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-semibold text-gray-800">
                            {user?.role || 'User'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                            {user?.role?.toLowerCase() || 'Role'}
                        </span>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
