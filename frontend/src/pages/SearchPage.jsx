import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import { movies } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const genre = searchParams.get('genre') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    source: 'database'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    if (query || genre) {
      performSearch();
    }
  }, [query, genre, page]);
  
  const performSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await movies.search(query, genre, page);
      
      setSearchResults(response.data.movies);
      setPagination({
        currentPage: response.data.current_page || 1,
        totalPages: response.data.pages || 1,
        totalItems: response.data.total || 0,
        source: response.data.source || 'database'
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    setSearchParams({ 
      query, 
      genre, 
      page: newPage.toString() 
    });
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };
  
  const handleGenreSelect = (selectedGenre) => {
    setSearchParams({
      query,
      genre: selectedGenre,
      page: '1'  // Reset to first page when changing genre
    });
  };
  
  const renderSearchMessage = () => {
    if (!query && !genre) {
      return <p className="text-gray-500">Enter a search term or select a genre to find movies</p>;
    }
    
    const queryPart = query ? `"${query}"` : '';
    const genrePart = genre ? `in genre ${genre}` : '';
    const connector = queryPart && genrePart ? ' ' : '';
    const totalPart = pagination.totalItems > 0 
      ? `Found ${pagination.totalItems} movies`
      : 'No movies found';
    
    return (
      <p className="text-gray-600">
        {totalPart} {queryPart}{connector}{genrePart}
      </p>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Movies</h1>
      
      <div className="mb-8">
        <SearchBar />
      </div>
      
      <div className="md:flex md:items-start">
        {/* Filters - Desktop */}
        <div className="hidden md:block md:w-1/4 md:pr-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4">Filters</h2>
            <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
          </div>
        </div>
        
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <span className="font-medium">Filters</span>
            <FontAwesomeIcon icon={faFilter} />
          </button>
          
          {showFilters && (
            <div className="mt-2 bg-white p-4 rounded-lg shadow-sm">
              <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="md:w-3/4">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            {renderSearchMessage()}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-5xl mb-4" />
              <h2 className="text-xl font-bold mb-2">No movies found</h2>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResults.map(movie => (
                  <MovieCard key={movie.id} movie={movie} showRating={true} />
                ))}
              </div>
              
              {pagination.source === 'database' && (
                <Pagination 
                  currentPage={pagination.currentPage} 
                  totalPages={pagination.totalPages} 
                  onPageChange={handlePageChange} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;