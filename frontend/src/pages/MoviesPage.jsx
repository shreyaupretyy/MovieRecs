import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import GenreFilter from '../components/GenreFilter';
import { movies } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';

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
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Movies</h1>
      
      <div className="md:flex md:items-start">
        {/* Filters - Desktop */}
        <div className="hidden md:block md:w-1/4 md:pr-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4">Filters</h2>
            <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Sort By</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <select 
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleOrderToggle}
                  className="flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  <FontAwesomeIcon 
                    icon={faSortAmountDown} 
                    className={`mr-2 ${order === 'asc' ? 'transform rotate-180' : ''}`}
                  />
                  {order === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <span className="font-medium">Filters & Sort</span>
            <FontAwesomeIcon icon={faFilter} />
          </button>
          
          {showFilters && (
            <div className="mt-2 bg-white p-4 rounded-lg shadow-sm">
              <GenreFilter onGenreSelect={handleGenreSelect} selectedGenre={genre} />
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Sort By</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <select 
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleOrderToggle}
                    className="flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon 
                      icon={faSortAmountDown} 
                      className={`mr-2 ${order === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                    {order === 'asc' ? 'Ascending' : 'Descending'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="md:w-3/4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <p className="text-gray-600">
                  {genre 
                    ? `Showing ${genre} movies (${pagination.totalItems} results)` 
                    : `Showing all movies (${pagination.totalItems} results)`
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {moviesList && moviesList.length > 0 ? (
                  moviesList.map(movie => (
                    <MovieCard key={movie.id} movie={movie} showRating={true} />
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center text-gray-600">
                    No movies found matching your filters.
                  </div>
                )}
              </div>
              
              {pagination.totalPages > 1 && (
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

export default MoviesPage;