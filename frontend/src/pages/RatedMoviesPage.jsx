import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { ratings, movies } from '../services/api'; // Import movies API as well
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const RatedMoviesPage = () => {
  const { currentUser } = useAuth();
  const [ratedMovies, setRatedMovies] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const fetchRatedMovies = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the existing endpoint for ratings
      const response = await ratings.getUserRatings(page);
      
      if (!response.data || !response.data.ratings) {
        throw new Error('Unexpected response format');
      }
      
      console.log('User ratings response:', response.data);
      
      const ratingsList = response.data.ratings;
      
      // If there are no ratings, just set empty array
      if (ratingsList.length === 0) {
        setRatedMovies([]);
        setPagination({
          currentPage: response.data.current_page,
          totalPages: response.data.pages,
          totalItems: response.data.total
        });
        setIsLoading(false);
        return;
      }
      
      // For each rating, fetch the movie details
      const moviePromises = ratingsList.map(async (rating) => {
        try {
          const movieResponse = await movies.getById(rating.movie_id);
          const movieData = movieResponse.data;
          
          return {
            ...movieData,
            user_rating: rating.rating,
            user_review: rating.review,
            rated_at: rating.created_at,
            updated_at: rating.updated_at
          };
        } catch (err) {
          console.error(`Failed to fetch movie ${rating.movie_id}:`, err);
          return null;
        }
      });
      
      // Wait for all movie fetches to complete
      const moviesWithRatings = (await Promise.all(moviePromises)).filter(Boolean);
      
      setRatedMovies(moviesWithRatings);
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.pages,
        totalItems: response.data.total
      });
    } catch (err) {
      console.error('Error fetching rated movies:', err);
      setError('Failed to load your rated movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      fetchRatedMovies();
    }
  }, [currentUser]);
  
  const handlePageChange = (page) => {
    fetchRatedMovies(page);
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };
  
  const handleRatingChange = async (movieId, newRating) => {
    try {
      // Update local state optimistically
      setRatedMovies(prevMovies =>
        prevMovies.map(movie =>
          movie.id === movieId
            ? { ...movie, user_rating: newRating }
            : movie
        )
      );
      
      // Show success message
      const movieTitle = ratedMovies.find(m => m.id === movieId)?.title || 'Movie';
      setSuccessMessage(`Rating for "${movieTitle}" updated!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // If rating is removed, fetch ratings again to update the list
      if (newRating === 0) {
        // Wait a moment for backend to process the deletion
        setTimeout(() => {
          fetchRatedMovies(pagination.currentPage);
        }, 500);
      }
    } catch (err) {
      console.error('Error updating rating:', err);
      setError('Failed to update rating. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const handleDeleteRating = async (movieId) => {
    try {
      // Ask for confirmation
      if (!window.confirm('Are you sure you want to remove this rating?')) {
        return;
      }
      
      await ratings.delete(movieId);
      
      // Remove movie from local state
      setRatedMovies(prevMovies => 
        prevMovies.filter(movie => movie.id !== movieId)
      );
      
      // Update pagination if needed
      if (ratedMovies.length === 1 && pagination.currentPage > 1) {
        // If this was the last item on the page, go to previous page
        handlePageChange(pagination.currentPage - 1);
      } else if (ratedMovies.length === 1) {
        // If this was the last item on the first page, refresh
        fetchRatedMovies(1);
      } else {
        // Just update pagination info
        setPagination(prev => ({
          ...prev,
          totalItems: prev.totalItems - 1
        }));
      }
      
      // Show success message
      setSuccessMessage('Rating removed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError('Failed to remove rating. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-4">Please sign in</h2>
          <p className="mb-4">You need to be signed in to view your rated movies.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Rated Movies</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : ratedMovies.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-6">
            You've rated <span className="font-semibold">{pagination.totalItems}</span> movies so far.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ratedMovies.map(movie => (
              <div key={movie.id} className="flex flex-col h-full relative group">
                <MovieCard 
                  movie={movie} 
                  showRating={true}
                  onRatingChange={(movieId, newRating) => handleRatingChange(movieId, newRating)}
                />
                
                <div className="mt-2 pt-2 px-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-500">
                      <FontAwesomeIcon icon={faStar} className="mr-1" />
                      <span className="font-medium">{movie.user_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {movie.rated_at ? `Rated: ${new Date(movie.rated_at).toLocaleDateString()}` : ''}
                    </span>
                  </div>
                  {movie.user_review && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="line-clamp-3">{movie.user_review}</p>
                    </div>
                  )}
                  
                  {/* Delete button that appears on hover */}
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteRating(movie.id);
                    }}
                    title="Remove rating"
                    aria-label="Remove rating"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination 
                currentPage={pagination.currentPage} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            You haven't rated any movies yet. Start rating movies to keep track of your opinions!
          </p>
          <Link 
            to="/movies" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default RatedMoviesPage;