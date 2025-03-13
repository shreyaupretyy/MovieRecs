import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import RatingStars from './RatingStars';
import { useAuth } from '../contexts/AuthContext';
import { ratings } from '../services/api';

const MovieCard = ({ movie, showRating = false, onRatingChange }) => {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(movie.user_rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105 h-full">
      <Link to={`/movies/${movie.id}`}>
        {movie.poster_path ? (
          <img 
            src={movie.poster_path} 
            alt={movie.title} 
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </Link>
      
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