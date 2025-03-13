import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { movies } from '../services/api';

const SearchResultsPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const genreFilter = searchParams.get('genre') || '';
  const sortBy = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [movieResults, setMovieResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [genres, setGenres] = useState([]);

  // Debug log on mount and when search params change
  useEffect(() => {
    console.log("SearchResultsPage - Current URL:", location.pathname + location.search);
    console.log("SearchResultsPage - Search params:", {
      search: searchQuery,
      genre: genreFilter,
      sort: sortBy,
      page: page
    });
  }, [location, searchQuery, genreFilter, sortBy, page]);
  
  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movies.getGenres();
        if (response.data && response.data.genres) {
          setGenres(response.data.genres);
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Perform search when parameters change
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Executing search with: query=${searchQuery}, genre=${genreFilter}, page=${page}, sort=${sortBy}`);
        
        // Get search results
        const response = await movies.search(
          searchQuery,
          genreFilter,
          page,
          20, // per_page
          sortBy,
          'desc'
        );
        
        console.log("API Response:", response.data);
        
        if (response.data && response.data.movies) {
          console.log(`Found ${response.data.total} movies matching the search criteria`);
          setMovieResults(response.data.movies);
          setPagination({
            currentPage: response.data.current_page,
            totalPages: response.data.pages,
            totalItems: response.data.total
          });
        } else {
          console.log('No search results found or unexpected response format');
          setMovieResults([]);
          setError('No results found. Please try a different search term.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [searchQuery, genreFilter, page, sortBy]);

  
  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  const handleSortChange = (event) => {
    searchParams.set('sort', event.target.value);
    searchParams.set('page', '1'); // Reset to first page
    setSearchParams(searchParams);
  };
  
  const handleGenreChange = (genre) => {
    if (genre === '') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre);
    }
    searchParams.set('page', '1'); // Reset to first page
    setSearchParams(searchParams);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const query = formData.get('search');
    
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    
    searchParams.set('page', '1'); // Reset to first page
    setSearchParams(searchParams);
  };
  
  const handleRatingChange = (movieId, newRating) => {
    // Update local state
    setMovieResults(prevMovies =>
      prevMovies.map(movie =>
        movie.id === movieId ? { ...movie, user_rating: newRating } : movie
      )
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {searchQuery ? (
            <>
              Search results for{" "}
              <span className="text-blue-600">"{searchQuery}"</span>
            </>
          ) : (
            "Browse Movies"
          )}
        </h1>
        
        {pagination.totalItems > 0 && (
          <p className="text-gray-600">
            Found {pagination.totalItems} movie{pagination.totalItems !== 1 ? 's' : ''}
            {genreFilter && <> in <span className="font-medium">{genreFilter}</span></>}
          </p>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Search bar */}
        <div className="w-full md:w-2/3">
          <div className="relative">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search for movies..."
                className="w-full px-4 py-3 pl-10 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded">
                Search
              </button>
            </form>
          </div>
        </div>
        
        {/* Sort dropdown */}
        <div className="w-full md:w-1/3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-4 py-3 pl-10 text-gray-900 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="vote_average">Sort by Rating</option>
              <option value="release_date">Sort by Release Date</option>
              <option value="title">Sort by Title</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Genre filters */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button
            onClick={() => handleGenreChange('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              genreFilter === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Genres
          </button>
          
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                genreFilter === genre
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      
      {/* Active filters display */}
      {(searchQuery || genreFilter) && (
        <div className="flex flex-wrap items-center mb-6 gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {searchQuery && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              <span className="mr-1">Search: {searchQuery}</span>
              <button
                onClick={() => {
                  searchParams.delete('search');
                  searchParams.set('page', '1');
                  setSearchParams(searchParams);
                }}
                className="ml-1 focus:outline-none"
                aria-label="Remove search filter"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {genreFilter && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              <span className="mr-1">Genre: {genreFilter}</span>
              <button
                onClick={() => {
                  searchParams.delete('genre');
                  searchParams.set('page', '1');
                  setSearchParams(searchParams);
                }}
                className="ml-1 focus:outline-none"
                aria-label="Remove genre filter"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              setSearchParams({});
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : movieResults.length > 0 ? (
        <>
          {/* Movie results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movieResults.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showRating={true} 
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : !isLoading && (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">No movies found</h2>
          <p className="text-gray-600 mb-4">
            {searchQuery ? (
              <>No movies match your search criteria. Try changing your filters or search term.</>
            ) : (
              <>Select a genre or enter a search term to find movies.</>
            )}
          </p>
          {(searchQuery || genreFilter) && (
            <button
              onClick={() => {
                setSearchParams({});
              }}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;