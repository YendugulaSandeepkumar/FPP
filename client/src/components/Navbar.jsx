import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md text-gray-800 shadow-sm border-b border-gray-100 p-4 fixed w-full z-50 top-0 left-0 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo Area */}
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate(role === 'Farmer' ? '/farmer/dashboard' : '/vao/dashboard')}>
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 transition-transform group-hover:rotate-12">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Farmer Paddy Portal
            </h1>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{role} Panel</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <NotificationBell />
          
          <div 
            onClick={() => navigate('/profile')} 
            className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
            className="md:hidden text-gray-600 hover:text-primary-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 animate-slide-up">
            <div 
                className="flex items-center space-x-3 mb-4 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
            >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold uppercase">
                    {user?.name?.charAt(0)}
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 text-red-600 py-2 border-t border-gray-100 pt-3"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
