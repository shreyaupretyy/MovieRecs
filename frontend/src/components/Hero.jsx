import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-primary-900 text-white">
      {/* Decorative pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroPattern)" />
        </svg>
      </div>
      
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6">
            Find Your Perfect Movie Match
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl">
            Get personalized movie recommendations based on your taste. Discover new favorites and explore films you'll love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/movies"
              className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
            >
              Explore Movies
            </Link>
            <Link
              to="/signup"
              className="inline-block bg-white hover:bg-primary-50 text-primary-700 font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;