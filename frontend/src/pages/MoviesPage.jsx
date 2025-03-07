import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searching, setSearching] = useState(false);
  
  const moviesPerPage = 20;
  
  // List of genres (we'll extract these from the API data later)
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'TV Movie', 'Thriller', 'War', 'Western'
  ];

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * moviesPerPage;
      
      let response;
      if (searchQuery.trim() || selectedGenre) {
        // Search API call
        response = await axios.get('http://localhost:5000/api/movies/search', {
          params: {
            query: searchQuery.trim(),
            genre: selectedGenre
          }
        });
        
        setMovies(response.data.movies);
        setTotalMovies(response.data.count);
      } else {
        // Regular paginated API call
        response = await axios.get('http://localhost:5000/api/movies', {
          params: {
            limit: moviesPerPage,
            offset: offset
          }
        });
        
        setMovies(response.data.movies);
        setTotalMovies(response.data.total);
      }
      
      setLoading(false);
      setSearching(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    setCurrentPage(1);
    fetchMovies();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setCurrentPage(1);
    fetchMovies();
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    setSearching(true);
    setTimeout(() => {
      fetchMovies();
    }, 100);
  };

  const totalPages = Math.ceil(totalMovies / moviesPerPage);

  if (loading && !searching) {
    return <LoadingSpinner />;
  }

  if (error && !searching) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => fetchMovies()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Discover Movies</h1>
        
        {/* Search and Filter Section */}
        <SearchFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          genres={genres}
          handleSearch={handleSearch}
          handleGenreChange={handleGenreChange}
          handleClearSearch={handleClearSearch}
        />
        
        {/* Results Section */}
        <div className="mt-8">
          {searching ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && !searchQuery && !selectedGenre && (
                <div className="mt-12">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700">No movies found</h3>
              <p className="text-gray-500 mt-2">Try changing your search or filter criteria</p>
              {(searchQuery || selectedGenre) && (
                <button 
                  className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;