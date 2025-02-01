import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Menu, 
  X, 
  ChevronDown, 
  Book, 
  Users, 
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
        ${location.pathname === to 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </Link>
  );

  return (
    <>
      <nav 
        className={`fixed w-full top-0 z-40 transition-all duration-300 
          ${isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm' 
            : 'bg-white'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
            >
              <MapPin 
                className="text-blue-600 transition-transform group-hover:scale-110" 
                size={24} 
              />
              <span className="font-semibold text-gray-900">UK Postcode Lookup</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/documentation" icon={Book}>
                Documentation
              </NavLink>
              
              {isAdmin && (
                <NavLink to="/userManagement" icon={Users}>
                  User Management
                </NavLink>
              )}
              
              {user ? (
                <>
                  <NavLink to="/dashboard" icon={LayoutDashboard}>
                    Dashboard
                  </NavLink>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                        alt="User"
                        className="w-6 h-6 rounded-full"
                      />
                      <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" icon={LogIn}>
                    Sign In
                  </NavLink>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus size={20} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col gap-2">
                  <NavLink 
                    to="/documentation" 
                    icon={Book}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Documentation
                  </NavLink>
                  
                  {isAdmin && (
                    <NavLink 
                      to="/userManagement" 
                      icon={Users}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      User Management
                    </NavLink>
                  )}
                  
                  {user ? (
                    <>
                      <NavLink 
                        to="/dashboard" 
                        icon={LayoutDashboard}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </NavLink>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4">
                        <div className="flex items-center gap-2 mb-4">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Account</span>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <NavLink 
                        to="/login" 
                        icon={LogIn}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </NavLink>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 mx-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus size={20} />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}