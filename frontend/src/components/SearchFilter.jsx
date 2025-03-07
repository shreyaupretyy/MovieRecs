import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedGenre, 
  genres, 
  handleSearch, 
  handleGenreChange,
  handleClearSearch
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Genre dropdown */}
        <div className="w-full md:w-48">
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search button */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
        
        {/* Clear button (only shows when filters are active) */}
        {(searchQuery || selectedGenre) && (
          <div className="w-full md:w-auto">
            <button
              type="button"
              onClick={handleClearSearch}
              className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilter;