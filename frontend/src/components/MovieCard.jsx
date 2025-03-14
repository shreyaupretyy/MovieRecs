import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faBookmark as fasBookmark, 
  faCheck, 
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import RatingStars from './RatingStars';
import { useAuth } from '../contexts/AuthContext';
import { ratings, watchlist as watchlistApi } from '../services/api';

const MovieCard = ({ movie, showRating = false, onRatingChange, onWatchlistChange }) => {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(movie.user_rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(movie.in_watchlist || false);
  const [watchlistId, setWatchlistId] = useState(movie.watchlist_id || null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState(null);
  const [ratingMessage, setRatingMessage] = useState(null);
  
  // Extract release year from date
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : '';
  
  // Format genres - handle both pipe and comma separated genres
  const genres = movie.genres 
    ? (movie.genres.includes('|') 
        ? movie.genres.split('|')
        : movie.genres.includes(',') 
          ? movie.genres.split(',') 
          : [movie.genres])
    : [];

  // Show temporary message
  const showTemporaryMessage = (message, type, state, setState) => {
    setState({ text: message, type });
    setTimeout(() => {
      setState(null);
    }, 2000);
  };

  // Check if the movie is in the user's watchlist
  useEffect(() => {
    if (!currentUser) return;
    
    // Set watchlist status from movie data if available
    if (movie.in_watchlist !== undefined) {
      setInWatchlist(movie.in_watchlist);
      if (movie.watchlist_id) {
        setWatchlistId(movie.watchlist_id);
      }
    } else {
      // Otherwise check via API
      const checkWatchlistStatus = async () => {
        try {
          setWatchlistLoading(true);
          const response = await watchlistApi.checkMovieInWatchlist(movie.id);
          
          if (response?.data?.status === 'success') {
            setInWatchlist(response.data.in_watchlist || false);
            if (response.data.in_watchlist && response.data.watchlist_id) {
              setWatchlistId(response.data.watchlist_id);
            }
          }
        } catch (err) {
          console.error(`Error checking watchlist for movie ${movie.id}:`, err);
        } finally {
          setWatchlistLoading(false);
        }
      };
      
      checkWatchlistStatus();
    }
  }, [movie.id, currentUser, movie.in_watchlist, movie.watchlist_id]);
  
  // Fetch the user's rating when component mounts
  useEffect(() => {
    if (!currentUser || !showRating) return;
    
    // Set rating from movie data if available
    if (movie.user_rating) {
      setUserRating(movie.user_rating);
      return;
    }
    
    // Otherwise fetch rating via API
    const fetchRating = async () => {
      try {
        const response = await ratings.get(movie.id);
        if (response?.data?.rating?.rating) {
          setUserRating(response.data.rating.rating);
        }
      } catch (err) {
        // User hasn't rated this movie yet
        console.log(`No rating found for movie ${movie.id}`);
      }
    };
    
    fetchRating();
  }, [movie.id, currentUser, showRating, movie.user_rating]);
  
  // Handle rating submit
  const handleRate = async (value) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await ratings.add(movie.id, value);
      
      if (response?.data?.status === 'success') {
        // Update local state
        setUserRating(value);
        
        // Show success message
        showTemporaryMessage("Rating saved", "success", ratingMessage, setRatingMessage);
        
        // Notify parent component
        if (onRatingChange) {
          onRatingChange(movie.id, value);
        }
      } else {
        throw new Error("Unexpected response when saving rating");
      }
    } catch (err) {
      console.error('Error rating movie:', err);
      showTemporaryMessage("Failed to save rating", "error", ratingMessage, setRatingMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle rating removal
  const handleRemoveRating = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser || userRating === 0) return;
    
    try {
      setIsSubmitting(true);
      
      await ratings.delete(movie.id);
      
      // Update local state
      setUserRating(0);
      
      // Show success message
      showTemporaryMessage("Rating removed", "success", ratingMessage, setRatingMessage);
      
      // Notify parent component
      if (onRatingChange) {
        onRatingChange(movie.id, 0);
      }
    } catch (err) {
      console.error('Error removing rating:', err);
      showTemporaryMessage("Failed to remove rating", "error", ratingMessage, setRatingMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle watchlist status
  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      showTemporaryMessage("Please log in to use watchlist", "error", watchlistMessage, setWatchlistMessage);
      return;
    }
    
    setWatchlistLoading(true);
    
    try {
      if (inWatchlist && watchlistId) {
        // Remove from watchlist
        await watchlistApi.removeFromWatchlist(watchlistId);
        
        // Update local state
        setInWatchlist(false);
        setWatchlistId(null);
        
        // Show success message
        showTemporaryMessage("Removed from watchlist", "success", watchlistMessage, setWatchlistMessage);
        
        // Notify parent component
        if (onWatchlistChange) {
          onWatchlistChange(movie.id, false, null);
        }
      } else {
        // Add to watchlist
        const response = await watchlistApi.addToWatchlist(movie.id);
        
        if (response?.data?.status === 'success' && response.data.watchlist_id) {
          // Update local state
          setInWatchlist(true);
          setWatchlistId(response.data.watchlist_id);
          
          // Show success message
          showTemporaryMessage("Added to watchlist", "success", watchlistMessage, setWatchlistMessage);
          
          // Notify parent component
          if (onWatchlistChange) {
            onWatchlistChange(movie.id, true, response.data.watchlist_id);
          }
        } else {
          throw new Error(response?.data?.message || "Failed to add to watchlist");
        }
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      
      // Show error message
      const errorMsg = err.response?.data?.message || err.message || "Error updating watchlist";
      showTemporaryMessage(errorMsg, "error", watchlistMessage, setWatchlistMessage);
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-4px] h-full">
      <div className="relative">
        <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] bg-gray-200">
          {movie.poster_path ? (
            <img 
              src={movie.poster_path} 
              alt={movie.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Link>
        
        {/* Watchlist Button */}
        {currentUser && (
          <>
            <button
              onClick={handleToggleWatchlist}
              disabled={watchlistLoading}
              className={`absolute top-2 right-2 p-2 rounded-full ${
                inWatchlist 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-800 bg-opacity-70 text-white hover:bg-blue-500'
              } transition-colors duration-200 shadow-md`}
              title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {watchlistLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon 
                  icon={inWatchlist ? fasBookmark : farBookmark} 
                  className="h-4 w-4"
                />
              )}
            </button>
            
            {/* Watchlist message */}
            {watchlistMessage && (
              <div className={`absolute top-12 right-2 text-xs px-2 py-1 rounded-md shadow-md z-10 ${
                watchlistMessage.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <span className="flex items-center whitespace-nowrap">
                  <FontAwesomeIcon 
                    icon={watchlistMessage.type === 'success' ? faCheck : faExclamationCircle} 
                    className="mr-1" 
                  />
                  {watchlistMessage.text}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-4">
        <Link 
          to={`/movies/${movie.id}`}
          className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-150"
        >
          {movie.title} {releaseYear && <span className="text-gray-500 text-sm">({releaseYear})</span>}
        </Link>
        
        <div className="mt-2 mb-3 min-h-[24px]">
          {genres.slice(0, 3).map((genre, index) => (
            genre.trim() && (
              <span 
                key={index} 
                className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1"
              >
                {genre.trim()}
              </span>
            )
          ))}
        </div>
        
        <div className="flex items-center mb-2">
          <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
          <span className="font-medium">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          <span className="text-gray-500 text-sm ml-1">({movie.vote_count?.toLocaleString() || 0})</span>
        </div>
        
        {showRating && currentUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                {isSubmitting ? 'Saving...' : 'Your rating:'}
              </span>
              
              {userRating > 0 && (
                <button
                  onClick={handleRemoveRating}
                  disabled={isSubmitting}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center"
                  title="Remove rating"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Remove
                </button>
              )}
            </div>
            
            <div className="relative">
              <RatingStars
                initialRating={userRating}
                onRate={handleRate}
                size="sm"
              />
              
              {/* Rating message */}
              {ratingMessage && (
                <div className={`absolute top-full left-0 mt-1 text-xs px-2 py-1 rounded-md shadow-md z-10 ${
                  ratingMessage.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  <span className="flex items-center whitespace-nowrap">
                    <FontAwesomeIcon 
                      icon={ratingMessage.type === 'success' ? faCheck : faExclamationCircle} 
                      className="mr-1" 
                    />
                    {ratingMessage.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;