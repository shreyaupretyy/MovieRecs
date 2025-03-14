import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBookmark as fasBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import RatingStars from './RatingStars';
import { useAuth } from '../contexts/AuthContext';
import { ratings } from '../services/api';

const MovieCard = ({ movie, showRating = false, onRatingChange, onWatchlistChange }) => {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(movie.user_rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(movie.in_watchlist || false);
  const [watchlistId, setWatchlistId] = useState(movie.watchlist_id || null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState(null);
  
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
  
  // Fetch the user's rating for this movie when the component mounts
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!currentUser || !showRating) return;
      
      try {
        const ratingResponse = await ratings.get(movie.id);
        
        if (ratingResponse.data && 
            ratingResponse.data.rating && 
            ratingResponse.data.rating.rating) {
          setUserRating(ratingResponse.data.rating.rating);
        }
      } catch (err) {
        // User hasn't rated this movie yet or error occurred
        console.log(`No rating found for movie ${movie.id}`);
      }
    };
    
    // Set user rating from movie data if available
    if (movie.user_rating) {
      setUserRating(movie.user_rating);
    } else {
      fetchUserRating();
    }
  }, [movie.id, currentUser, showRating, movie.user_rating]);

  // Check if the movie is in the user's watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!currentUser) return;
      
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/watchlist/check/${movie.id}?_t=${timestamp}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response when checking watchlist status');
            return;
          }
          
          const data = await response.json();
          console.log(`Watchlist check for movie ${movie.id}:`, data);
          
          if (data.status === 'success') {
            setInWatchlist(data.in_watchlist || false);
            if (data.in_watchlist && data.watchlist_id) {
              setWatchlistId(data.watchlist_id);
            }
          }
        } else {
          console.error(`Error checking watchlist status: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error checking watchlist status for movie ${movie.id}:`, err);
      }
    };
    
    // Set watchlist status from movie data if available
    if (movie.in_watchlist !== undefined) {
      setInWatchlist(movie.in_watchlist);
      if (movie.watchlist_id) {
        setWatchlistId(movie.watchlist_id);
      }
    } else if (currentUser) {
      checkWatchlist();
    }
  }, [movie.id, currentUser, movie.in_watchlist, movie.watchlist_id]);
  
  // Handle rating
  const handleRate = async (value) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Submit the rating
      await ratings.add(movie.id, value);
      
      // Update local state
      setUserRating(value);
      
      // Notify parent component if callback provided
      if (onRatingChange) {
        onRatingChange(movie.id, value);
      }
    } catch (err) {
      console.error('Error rating movie:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle watchlist status
  const handleToggleWatchlist = async (e) => {
    e.preventDefault(); // Prevent navigation to movie page
    e.stopPropagation(); // Stop event propagation
    
    if (!currentUser) {
      alert("Please log in to add movies to your watchlist");
      return;
    }
    
    setWatchlistLoading(true);
    setWatchlistError(null);
    
    try {
      const timestamp = Date.now();
      
      if (inWatchlist && watchlistId) {
        // Remove from watchlist
        console.log(`Removing movie ${movie.id} from watchlist (watchlist_id: ${watchlistId})`);
        
        const response = await fetch(`/api/watchlist/${watchlistId}?_t=${timestamp}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        let responseData;
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        }
        
        if (response.ok) {
          console.log('Movie removed from watchlist:', responseData);
          setInWatchlist(false);
          setWatchlistId(null);
          
          // Notify parent component if callback provided
          if (onWatchlistChange) {
            onWatchlistChange(movie.id, false, null);
          }
        } else {
          throw new Error(responseData?.message || `Failed to remove from watchlist (${response.status})`);
        }
      } else {
        // Add to watchlist
        console.log(`Adding movie ${movie.id} to watchlist`);
        
        const response = await fetch(`/api/watchlist?_t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ 
            movie_id: movie.id,
            added_at: new Date().toISOString()
          }),
          credentials: 'include'
        });
        
        let responseData;
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          console.error('Non-JSON response when adding to watchlist:', await response.text());
          throw new Error('Received invalid response from server');
        }
        
        if (response.ok && responseData.status === 'success') {
          console.log('Movie added to watchlist:', responseData);
          setInWatchlist(true);
          setWatchlistId(responseData.watchlist_id);
          
          // Notify parent component if callback provided
          if (onWatchlistChange) {
            onWatchlistChange(movie.id, true, responseData.watchlist_id);
          }
        } else {
          throw new Error(responseData?.message || `Failed to add to watchlist (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      setWatchlistError(err.message || 'Failed to update watchlist');
      
      // Show error message briefly
      if (err.message) {
        const errorMessage = err.message.includes('already in your watchlist') 
          ? 'Already in watchlist'
          : 'Error updating watchlist';
        
        alert(errorMessage);
      }
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105 h-full">
      <div className="relative">
        <Link to={`/movies/${movie.id}`}>
          {movie.poster_path ? (
            <img 
              src={movie.poster_path} 
              alt={movie.title} 
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Link>
        
        {/* Watchlist Button */}
        {currentUser && (
          <button
            onClick={handleToggleWatchlist}
            disabled={watchlistLoading}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              inWatchlist 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-800 bg-opacity-70 text-white hover:bg-blue-500'
            } transition-colors duration-200 shadow-md`}
            title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watchlistLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FontAwesomeIcon 
                icon={inWatchlist ? fasBookmark : farBookmark} 
                className={`h-4 w-4 ${inWatchlist ? 'animate-pulse' : ''}`}
              />
            )}
          </button>
        )}
      </div>
      
      <div className="p-4">
        <Link 
          to={`/movies/${movie.id}`}
          className="block text-lg font-medium text-gray-900 hover:text-blue-600"
        >
          {movie.title} {releaseYear && <span className="text-gray-500 text-sm">({releaseYear})</span>}
        </Link>
        
        <div className="mt-2 mb-3">
          {genres.slice(0, 2).map((genre, index) => (
            <span 
              key={index} 
              className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1"
            >
              {genre.trim()}
            </span>
          ))}
        </div>
        
        <div className="flex items-center mb-2">
          <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          <span className="text-gray-500 ml-1">({movie.vote_count?.toLocaleString() || 0})</span>
        </div>
        
        {showRating && currentUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="block mb-1 text-xs text-gray-500">
              {isSubmitting ? 'Saving...' : 'Your rating:'}
            </span>
            <RatingStars
              initialRating={userRating}
              onRate={handleRate}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;