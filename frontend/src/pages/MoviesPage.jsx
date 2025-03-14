import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import GenreFilter from '../components/GenreFilter';
import { movies } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSortAmountDown, 
  faTimes,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const genre = searchParams.get('genre') || '';
  const sortBy = searchParams.get('sort') || 'vote_average';
  const order = searchParams.get('order') || 'desc';
  
  const [moviesList, setMoviesList] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'title', label: 'Title' },
    { value: 'vote_average', label: 'Rating' }
  ];
  
  useEffect(() => {
    fetchMovies();
  }, [page, genre, sortBy, order]);
  
  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the updated search method with all parameters
      const response = await movies.search('', genre, page, 20, sortBy, order);
      
      setMoviesList(response.data.movies);
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.pages,
        totalItems: response.data.total
      });
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    setSearchParams({ 
      page: newPage.toString(), 
      genre, 
      sort: sortBy, 
      order 
    });
    
    // Scroll to top of the page with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleGenreSelect = (selectedGenre) => {
    setSearchParams({ 
      page: '1',  // Reset to first page when changing genre
      genre: selectedGenre,
      sort: sortBy,
      order
    });
  };
  
  const handleSortChange = (e) => {
    setSearchParams({ 
      page: '1',  // Reset to first page when changing sort
      genre,
      sort: e.target.value,
      order
    });
  };
  
  const handleOrderToggle = () => {
    setSearchParams({
      page: '1',  // Reset to first page when changing order
      genre,
      sort: sortBy,
      order: order === 'asc' ? 'desc' : 'asc'
    });
  };
  
  const clearFilters = () => {
    setSearchParams({
      page: '1'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Explore Movies</h1>
          <p className="text-gray-600">Discover and filter through our collection of films</p>
        </div>
        
        <div className="md:flex md:gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block md:w-1/4 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-800">Filters</h2>
                {(genre || sortBy !== 'vote_average' || order !== 'desc') && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Sort Options</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Sort By</label>
                    <select 
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Order</label>
                    <button
                      onClick={handleOrderToggle}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
                    >
                      <span>{order === 'asc' ? 'Ascending' : 'Descending'}</span>
                      <FontAwesomeIcon 
                        icon={faSortAmountDown} 
                        className={`text-gray-500 ${order === 'asc' ? 'transform rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile filter toggle */}
          <div className="md:hidden mb-6">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gray-500 mr-3" />
                <span className="font-medium text-gray-800">Filters & Sort</span>
              </div>
              <FontAwesomeIcon 
                icon={showFilters ? faChevronUp : faChevronDown} 
                className="text-gray-500" 
              />
            </button>
            
            {showFilters && (
              <div className="mt-2 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-medium text-gray-800">Filters</h3>
                  {(genre || sortBy !== 'vote_average' || order !== 'desc') && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="mb-6 pb-5 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Genre</h4>
                  <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sort Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sort By</label>
                      <select 
                        value={sortBy}
                        onChange={handleSortChange}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Order</label>
                      <button
                        onClick={handleOrderToggle}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700"
                      >
                        <span>{order === 'asc' ? 'Ascending' : 'Descending'}</span>
                        <FontAwesomeIcon 
                          icon={faSortAmountDown} 
                          className={`text-gray-500 ${order === 'asc' ? 'transform rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Results */}
          <div className="md:w-3/4 flex-grow">
            {/* Results Header */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-medium">
                  {genre 
                    ? `${genre} Movies` 
                    : `All Movies`
                  }
                </p>
                <p className="text-sm text-gray-500">{pagination.totalItems} results</p>
              </div>
              
              {genre && (
                <button 
                  onClick={() => handleGenreSelect('')}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Clear genre
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                    <div className="h-64 bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-200 rounded mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                <div className="text-red-600 font-medium mb-2">Error</div>
                <p className="text-gray-700">{error}</p>
                <button 
                  onClick={fetchMovies}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {moviesList && moviesList.length > 0 ? (
                    moviesList.map(movie => (
                      <div key={movie.id} className="transition-all duration-200 transform hover:translate-y-[-4px]">
                        <MovieCard key={movie.id} movie={movie} showRating={true} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-600 mb-4">No movies found matching your filters.</p>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
                
                {pagination.totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination 
                      currentPage={pagination.currentPage} 
                      totalPages={pagination.totalPages} 
                      onPageChange={handlePageChange} 
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;