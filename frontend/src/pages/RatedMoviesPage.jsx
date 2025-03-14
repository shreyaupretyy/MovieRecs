import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { ratings, movies } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faExclamationTriangle, 
  faQuoteLeft, 
  faQuoteRight,
  faPen, 
  faEye, 
  faTimes,
  faCalendarAlt,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

const ReviewModal = ({ movie, onClose, onSave }) => {
  const [review, setReview] = useState(movie?.user_review || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!movie) return;
    
    try {
      setIsSaving(true);
      // Update the review while preserving the rating
      await ratings.add(movie.id, movie.user_rating, review);
      
      if (onSave) {
        onSave(movie.id, review);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving review:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!movie) return null;
  
  const ratingDate = movie.updated_at || movie.rated_at;
  const formattedDate = ratingDate ? 
    format(new Date(ratingDate), 'MMMM d, yyyy') : 'Unknown date';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-900 truncate pr-8">{movie.title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-500 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="flex mb-6">
            {/* Movie poster */}
            <div className="w-1/4 flex-shrink-0 mr-4">
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path} 
                  alt={movie.title}
                  className="rounded-md w-full h-auto shadow-md"
                />
              ) : (
                <div className="bg-gray-200 rounded-md w-full aspect-[2/3] flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-center bg-yellow-50 p-2 rounded-md">
                <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-2" />
                <span className="font-bold text-lg">{movie.user_rating.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Review content */}
            <div className="w-3/4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Your Review</h4>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">{formattedDate}</span>
                </div>
              </div>
              
              {isEditing ? (
                <div>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your thoughts about this movie..."
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="mr-2">Saving</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        'Save Review'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {review ? (
                    <div className="bg-gray-50 p-4 rounded-lg relative">
                      <FontAwesomeIcon 
                        icon={faQuoteLeft} 
                        className="text-gray-300 absolute top-2 left-2 text-sm" 
                      />
                      <div className="pl-4 pr-4 whitespace-pre-line text-gray-700">
                        {review}
                      </div>
                      <FontAwesomeIcon 
                        icon={faQuoteRight} 
                        className="text-gray-300 absolute bottom-2 right-2 text-sm" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic text-center">
                      You haven't written a review for this movie yet.
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      {review ? 'Edit Review' : 'Add Review'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Movie details */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold mb-2">Movie Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {movie.release_date && (
                <div>
                  <span className="text-gray-500">Released:</span> {new Date(movie.release_date).getFullYear()}
                </div>
              )}
              {movie.vote_average && (
                <div>
                  <span className="text-gray-500">Average Rating:</span> {movie.vote_average.toFixed(1)}/10
                </div>
              )}
              {movie.genres && (
                <div className="col-span-2">
                  <span className="text-gray-500">Genres:</span> {movie.genres}
                </div>
              )}
              {movie.director && (
                <div className="col-span-2">
                  <span className="text-gray-500">Director:</span> {movie.director}
                </div>
              )}
            </div>
            
            {movie.overview && (
              <div className="mt-3">
                <span className="text-gray-500 block mb-1">Synopsis:</span>
                <p className="text-sm text-gray-700">{movie.overview}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <div className="flex justify-between">
            <Link 
              to={`/movies/${movie.id}`}
              className="text-blue-600 hover:underline flex items-center"
            >
              View full movie details
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedMovie, setSelectedMovie] = useState(null);
  
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
          currentPage: response.data.pagination.page || 1,
          totalPages: response.data.pagination.pages || 1,
          totalItems: response.data.pagination.total || 0
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
            rating_id: rating.id,
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
        currentPage: response.data.pagination.page || 1,
        totalPages: response.data.pagination.pages || 1,
        totalItems: response.data.pagination.total || 0
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
  
  const handleReviewSave = (movieId, updatedReview) => {
    // Update local state
    setRatedMovies(prevMovies =>
      prevMovies.map(movie =>
        movie.id === movieId
          ? { ...movie, user_review: updatedReview, updated_at: new Date().toISOString() }
          : movie
      )
    );
    
    // Show success message
    const movieTitle = ratedMovies.find(m => m.id === movieId)?.title || 'Movie';
    setSuccessMessage(`Review for "${movieTitle}" saved!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const openReviewModal = (movie) => {
    setSelectedMovie(movie);
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
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-3" />
        Your Rated Movies
      </h1>
      
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
              <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col group">
                {/* Movie Card */}
                <div className="relative">
                  <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] bg-gray-200">
                    {movie.poster_path ? (
                      <img 
                        src={movie.poster_path} 
                        alt={movie.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Rating badge */}
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                    <span className="font-bold text-sm">{movie.user_rating.toFixed(1)}</span>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    onClick={() => handleDeleteRating(movie.id)}
                    title="Remove rating"
                    aria-label="Remove rating"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                
                {/* Movie Info */}
                <div className="p-4 flex-grow flex flex-col">
                  <Link 
                    to={`/movies/${movie.id}`}
                    className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-150 mb-1"
                  >
                    {movie.title}
                  </Link>
                  
                  <div className="text-sm text-gray-500 mb-2">
                    {movie.release_date && new Date(movie.release_date).getFullYear()}
                    {movie.vote_average && ` • ${movie.vote_average.toFixed(1)}/10`}
                  </div>
                  
                  {/* Review Preview */}
                  {movie.user_review ? (
                    <div className="mt-2">
                      <div className="bg-gray-50 p-3 rounded-md relative">
                        <FontAwesomeIcon 
                          icon={faQuoteLeft} 
                          className="text-gray-300 absolute top-1 left-1 text-xs" 
                        />
                        <p className="text-gray-700 text-sm line-clamp-3 pl-3">
                          {movie.user_review}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => openReviewModal(movie)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center w-full justify-center"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Read full review
                      </button>
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <button
                        onClick={() => openReviewModal(movie)}
                        className="w-full mt-2 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md flex items-center justify-center text-sm transition-colors"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                        Add a review
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Rated: {new Date(movie.rated_at).toLocaleDateString()}
                  </div>
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
      
      {/* Review Modal */}
      {selectedMovie && (
        <ReviewModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onSave={handleReviewSave}
        />
      )}
    </div>
  );
};

export default RatedMoviesPage;