import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and description */}
          <div className="mb-6 md:mb-0 md:w-1/3">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-primary-500 text-xl font-bold">MovieRecs</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Discover your next favorite movie with our personalized recommendation engine. 
              We analyze your preferences to suggest films you'll love.
            </p>
          </div>
          
          {/* Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/movies" className="text-gray-400 hover:text-white transition duration-200">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-gray-400 hover:text-white transition duration-200">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition duration-200">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@movierecs.com" className="text-gray-400 hover:text-white transition duration-200">
                    support@movierecs.com
                  </a>
                </li>
                <li>
                  <a href="https://github.com/yourusername/movie-recommender" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition duration-200">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} MovieRecs. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Movie data provided by <a href="http://www.omdbapi.com/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-400">OMDb API</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;