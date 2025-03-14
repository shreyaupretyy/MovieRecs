import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the auth context
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilm, 
  faEnvelope, 
  faHome,
  faPlayCircle,
  faUserPlus,
  faSignInAlt,
  faShield,
  faFileContract,
  faQuestion,
  faUsers,
  faStar,
  faChartLine,
  faUser,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faTwitter, 
  faFacebook, 
  faInstagram, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const { currentUser } = useAuth(); // Get current user from auth context
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-2">
                <FontAwesomeIcon icon={faFilm} className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold text-white">MovieRecs</span>
            </div>
            <p className="text-gray-400 mb-5 leading-relaxed">
              Discover movies tailored to your taste. Rate films and get personalized recommendations powered by our advanced algorithm.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} className="text-lg" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} className="text-lg" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} className="text-lg" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} className="text-lg" />
              </a>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5 flex items-center">
              <FontAwesomeIcon icon={faPlayCircle} className="mr-2 text-blue-500" />
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon={faHome} className="mr-2 text-xs text-gray-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon={faFilm} className="mr-2 text-xs text-gray-500" />
                  <span>Movies</span>
                </Link>
              </li>
              {currentUser && (
                <>
                  <li>
                    <Link to="/rated" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faStar} className="mr-2 text-xs text-gray-500" />
                      <span>My Ratings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/recommended" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faChartLine} className="mr-2 text-xs text-gray-500" />
                      <span>Recommendations</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Account Section - Conditionally rendered based on login status */}
          <div>
            <h3 className="text-lg font-semibold mb-5 flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-500" />
              {currentUser ? 'My Account' : 'Account'}
            </h3>
            <ul className="space-y-3">
              {currentUser ? (
                // Logged in user account links
                <>
                  <li>
                    <Link to="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-xs text-gray-500" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faCog} className="mr-2 text-xs text-gray-500" />
                      <span>Account Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/watchlist" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faStar} className="mr-2 text-xs text-gray-500" />
                      <span>My Watchlist</span>
                    </Link>
                  </li>
                </>
              ) : (
                // Non-logged in user links
                <>
                  <li>
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faSignInAlt} className="mr-2 text-xs text-gray-500" />
                      <span>Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-xs text-gray-500" />
                      <span>Register</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <FontAwesomeIcon icon={faQuestion} className="mr-2 text-xs text-gray-500" />
                      <span>Forgot Password</span>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon={faQuestion} className="mr-2 text-xs text-gray-500" />
                  <span>Help Center</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal and Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-5 flex items-center">
              <FontAwesomeIcon icon={faShield} className="mr-2 text-blue-500" />
              Legal
            </h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon={faShield} className="mr-2 text-xs text-gray-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon={faFileContract} className="mr-2 text-xs text-gray-500" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              {currentUser && (
                <li>
                  <Link to="data-policy" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <FontAwesomeIcon icon={faShield} className="mr-2 text-xs text-gray-500" />
                    <span>Data Policy</span>
                  </Link>
                </li>
              )}
            </ul>
            
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <a 
              href="mailto:contact@movierecs.com" 
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-500" />
              <span>contact@movierecs.com</span>
            </a>
          </div>
        </div>
      </div>
      
      
      
      {/* Copyright Bar */}
      <div className="border-t border-gray-800 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="w-full flex justify-center items-center text-gray-500 text-sm mb-2 md:mb-0">
              &copy; {currentYear} MovieRecs. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;