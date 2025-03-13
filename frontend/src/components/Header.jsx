import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUserCircle, 
  faSignOutAlt, 
  faTimes, 
  faFilm,
  faChartLine,
  faStar,
  faUser,
  faHome,
  faChevronDown,
  faCog
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
      
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Check if the current path matches the given path
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center group transition duration-300"
              aria-label="Homepage"
            >
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg mr-2 group-hover:bg-blue-700 transition-all">
                  <FontAwesomeIcon icon={faFilm} className="text-xl text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  MovieRecs
                </span>
              </div>
            </Link>
            
            <div className="hidden md:block ml-6">
              <div className="flex space-x-1">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                    ${isActivePath('/') 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                >
                  <FontAwesomeIcon icon={faHome} className={`mr-2 ${isActivePath('/') ? 'text-blue-400' : ''}`} />
                  <span>Home</span>
                </Link>
                
                <Link 
                  to="/movies" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                    ${isActivePath('/movies') 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                >
                  <FontAwesomeIcon icon={faFilm} className={`mr-2 ${isActivePath('/movies') ? 'text-blue-400' : ''}`} />
                  <span>Movies</span>
                </Link>
                
                {currentUser && (
                  <Link 
                    to="/rated" 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                      ${isActivePath('/rated') 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <FontAwesomeIcon icon={faStar} className={`mr-2 ${isActivePath('/rated') ? 'text-yellow-400' : ''}`} />
                    <span>My Ratings</span>
                  </Link>
                )}
                
                {currentUser && (
                  <Link 
                    to="/recommended" 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                      ${isActivePath('/recommended') 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <FontAwesomeIcon icon={faChartLine} className={`mr-2 ${isActivePath('/recommended') ? 'text-green-400' : ''}`} />
                    <span>For You</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Search and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Modern Search Button/Form */}
            <div className="relative" ref={searchRef}>
              {isSearchExpanded ? (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search movies..."
                        className="w-60 md:w-80 bg-gray-800 text-white rounded-lg py-2 pl-4 pr-10 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-blue-400 transition-colors"
                        aria-label="Search"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="ml-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white focus:outline-none transition-all"
                      aria-label="Close search"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-2.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 
                          focus:ring-blue-500 transition-all"
                  aria-label="Open search"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              )}
            </div>
            
            {/* User Profile Dropdown */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md 
                         px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  id="user-menu"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  <div className="h-7 w-7 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="font-medium text-sm truncate max-w-[100px]">
                      {currentUser.username || currentUser.email?.split('@')[0]}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-xs opacity-70" />
                  </div>
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800
                          ring-1 ring-black ring-opacity-5 transform opacity-100 scale-100 z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-200">
                        {currentUser.email}
                      </p>
                    </div>
                    
                    <Link 
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-500 dark:text-gray-400" />
                      Your Profile
                    </Link>
                    
                    <Link 
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faCog} className="mr-3 text-gray-500 dark:text-gray-400" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-1.5 rounded-md text-sm font-medium border border-gray-700
                       hover:bg-gray-800 transition-all duration-300 text-white"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-blue-600
                       hover:bg-blue-700 transition-all duration-300 text-white"
                >
                  Register
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-inner border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActivePath('/') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faHome} className="mr-3" />
              Home
            </Link>
            
            <Link 
              to="/movies" 
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActivePath('/movies') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faFilm} className="mr-3" />
              Movies
            </Link>
            
            {currentUser && (
              <Link 
                to="/rated" 
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/rated') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faStar} className="mr-3" />
                My Ratings
              </Link>
            )}
            
            {currentUser && (
              <Link 
                to="/recommended" 
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/recommended') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faChartLine} className="mr-3" />
                Recommendations
              </Link>
            )}
          </div>
          
          {/* Mobile Search */}
          <div className="px-4 py-3 border-t border-gray-700">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full bg-gray-700 text-white rounded-md py-2 pl-10 pr-4 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <button 
                  type="submit" 
                  className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-white"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          
          {/* Mobile User Menu */}
          {currentUser ? (
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {currentUser.username || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-sm font-medium text-gray-400 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-3" />
                  Your Profile
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="mr-3" />
                  Settings
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="flex justify-center items-center px-3 py-2 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex justify-center items-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Optional: Expanding search bar overlay for mobile when search is clicked */}
      {isSearchExpanded && (
        <div className="md:hidden absolute inset-x-0 top-16 bg-gray-800 p-4 z-50 border-t border-gray-700 shadow-lg">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-grow">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies..."
                className="w-full bg-gray-700 text-white rounded-md py-2 pl-10 pr-4
                       focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsSearchExpanded(false)}
              className="ml-2 p-2 rounded-md bg-gray-700 text-white focus:outline-none"
              aria-label="Close search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Header;