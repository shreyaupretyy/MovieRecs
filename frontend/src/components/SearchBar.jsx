import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { movies } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  const performSearch = async () => {
    if (query.trim().length < 2) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Explicitly search for movie titles only
      const response = await movies.search(query, '', 1, 5, 'title_only=true'); // Add title_only parameter
      
      if (response.data && response.data.movies) {
        setResults(response.data.movies);
        setShowResults(true);
      } else {
        setResults([]);
        setError('No results found');
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (query.trim().length > 0) {
      // Create a more explicit search URL with title_only parameter
      const searchQuery = encodeURIComponent(query.trim());
      console.log(`Navigating to search results with query: ${searchQuery}`);
      
      // Pass title_only parameter to ensure consistent search behavior
      navigate({
        pathname: '/movies',
        search: `?search=${searchQuery}&title_only=true`
      });
      
      setShowResults(false);
    }
  };
  
  const handleResultClick = (movieId) => {
    navigate(`/movies/${movieId}`);
    setShowResults(false);
    setQuery('');
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };
  
  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full px-4 py-3 pl-10 pr-10 text-gray-900 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={() => {
              if (query.trim().length >= 2 && results.length > 0) {
                setShowResults(true);
              }
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
              onClick={handleClearSearch}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>
      </form>
      
      {/* Search results dropdown */}
      {showResults && (query.trim().length >= 2) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-gray-500 text-center">
              {error}
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((movie) => (
                <li key={movie.id}>
                  <button
                    className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => handleResultClick(movie.id)}
                  >
                    <div className="flex-shrink-0 w-10 h-14 mr-3">
                      {movie.poster_path ? (
                        <img 
                          src={movie.poster_path} 
                          alt={movie.title} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="font-medium text-gray-900 truncate">{movie.title}</div>
                      <div className="text-sm text-gray-500">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                        {movie.vote_average ? ` • ${movie.vote_average.toFixed(1)}/10` : ''}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              
              {/* See all results button with proper search parameter */}
              <li className="border-t">
                <button
                  className="w-full px-4 py-2 text-center text-blue-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={handleSubmit}
                >
                  See all results for "{query}"
                </button>
              </li>
            </ul>
          ) : isLoading ? (
            <div className="p-4 text-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Searching...
            </div>
          ) : (
            <div className="p-4 text-gray-500 text-center">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;