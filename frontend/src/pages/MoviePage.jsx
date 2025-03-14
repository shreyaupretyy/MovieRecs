import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faCalendar, 
  faFilm, 
  faUser, 
  faArrowLeft, 
  faBookmark as fasBookmark,
  faCheck,
  faPen,
  faTimes,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import RatingStars from '../components/RatingStars';
import MovieCard from '../components/MovieCard';
import { movies, ratings, watchlist } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MoviePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Movie and rating state
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Watchlist state
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [watchlistNotes, setWatchlistNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState(null);
  const [watchlistMessage, setWatchlistMessage] = useState('');
  const [watchlistAddedTime, setWatchlistAddedTime] = useState('');
  
  // Show messages temporarily
  const showTemporaryMessage = (message, duration = 3000) => {
    setWatchlistMessage(message);
    setTimeout(() => {
      setWatchlistMessage('');
    }, duration);
  };
  
  // Format current UTC time
  const getCurrentUTCTime = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log("Fetching movie with ID:", id);
        const response = await movies.getById(id);
        
        console.log("API response:", response.data);
        
        // Check if we have a valid movie object in the response
        if (!response.data || (!response.data.id && !response.data.imdb_id)) {
          console.error("Invalid movie data received:", response.data);
          setError("Movie details not found or invalid format");
          return;
        }
        
        // Set the movie data
        setMovie(response.data);
        
        // Set similar movies if available, or fetch them separately if needed
        if (response.data.similar_movies && Array.isArray(response.data.similar_movies) && response.data.similar_movies.length > 0) {
          setSimilarMovies(response.data.similar_movies);
        } else {
          try {
            const similarResponse = await movies.getSimilar(id);
            if (similarResponse.data && Array.isArray(similarResponse.data.movies)) {
              setSimilarMovies(similarResponse.data.movies);
            }
          } catch (similarErr) {
            console.error("Could not fetch similar movies:", similarErr);
          }
        }
        
        // Set user rating and review if available in the movie data
        if (response.data.user_rating) {
          console.log("Setting user rating from movie data:", response.data.user_rating);
          setUserRating(response.data.user_rating);
        }
        
        if (response.data.user_review) {
          setUserReview(response.data.user_review);
        }
        
        // If we have currentUser but no user_rating yet, fetch it separately
        if (currentUser && !response.data.user_rating) {
          try {
            console.log("Fetching user rating separately");
            const ratingResponse = await ratings.get(id);
            
            console.log("Rating response:", ratingResponse.data);
            
            if (ratingResponse.data && ratingResponse.data.rating && ratingResponse.data.rating.rating) {
              console.log("Setting user rating from separate request:", ratingResponse.data.rating.rating);
              setUserRating(ratingResponse.data.rating.rating);
              
              if (ratingResponse.data.rating.review) {
                setUserReview(ratingResponse.data.rating.review);
              }
            }
          } catch (ratingErr) {
            console.log("Failed to get user rating or user hasn't rated:", ratingErr);
          }
        }
        
        // Check watchlist status if user is logged in
        if (currentUser) {
          await checkWatchlistStatus();
        }
        
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchMovieDetails();
    } else {
      setError('Movie ID is missing');
      setIsLoading(false);
    }
  }, [id, currentUser]);
  
  // Check if movie is in watchlist
  const checkWatchlistStatus = async () => {
    if (!currentUser || !id) return;
    
    try {
      setWatchlistLoading(true);
      setWatchlistError(null);
      
      const response = await watchlist.checkMovieInWatchlist(id);
      
      if (response.data) {
        console.log("Watchlist check response:", response.data);
        
        if (response.data.status === 'success') {
          setInWatchlist(response.data.in_watchlist || false);
          
          if (response.data.in_watchlist && response.data.watchlist_id) {
            setWatchlistId(response.data.watchlist_id);
            
            // Get watchlist item details if it's in the watchlist
            if (response.data.notes) {
              setWatchlistNotes(response.data.notes);
            }
            if (response.data.added_at) {
              setWatchlistAddedTime(response.data.added_at);
            }
          }
        } else {
          console.error("API returned error status:", response.data);
        }
      }
    } catch (err) {
      console.error("Failed to check watchlist status:", err);
      setWatchlistError("Could not check watchlist status");
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  // Toggle watchlist status
  const handleToggleWatchlist = async () => {
    if (!currentUser) return;
    
    setWatchlistLoading(true);
    setWatchlistError(null);
    
    try {
      if (inWatchlist && watchlistId) {
        // Remove from watchlist
        await watchlist.removeFromWatchlist(watchlistId);
        
        setInWatchlist(false);
        setWatchlistId(null);
        setWatchlistNotes('');
        setWatchlistAddedTime('');
        showTemporaryMessage('Removed from your watchlist');
      } else {
        // Add to watchlist
        const response = await watchlist.addToWatchlist(id, watchlistNotes);
        
        if (response.data && response.data.status === 'success') {
          setInWatchlist(true);
          setWatchlistId(response.data.watchlist_id);
          
          // Use the returned added_at time or fall back to current time
          const addedTime = response.data.added_at || getCurrentUTCTime();
          setWatchlistAddedTime(addedTime);
          
          showTemporaryMessage('Added to your watchlist');
        } else {
          throw new Error((response.data && response.data.message) || 'Failed to add to watchlist');
        }
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      setWatchlistError(err.message || 'Failed to update watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  // Save watchlist notes
  const handleSaveNotes = async () => {
    if (!currentUser || !watchlistId) return;
    
    setWatchlistLoading(true);
    setWatchlistError(null);
    
    try {
      await watchlist.updateNotes(watchlistId, watchlistNotes);
      setIsEditingNotes(false);
      showTemporaryMessage('Notes updated');
    } catch (err) {
      console.error('Error updating watchlist notes:', err);
      setWatchlistError('Failed to save notes');
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  // Handle rating change
  const handleRateMovie = async (value) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      console.log(`Submitting rating ${value} for movie ${movie.id}`);
      
      // Submit the rating (keep any existing review)
      const response = await ratings.add(movie.id, value, userReview);
      console.log("Rating submission response:", response.data);
      
      // Update local state
      setUserRating(value);
      
      // Get updated rating data
      try {
        const updatedRatingResponse = await ratings.get(id);
        if (updatedRatingResponse.data && updatedRatingResponse.data.rating) {
          // If there's a review in the response, update that as well
          if (updatedRatingResponse.data.rating.review) {
            setUserReview(updatedRatingResponse.data.rating.review);
          }
        }
      } catch (ratingErr) {
        console.error("Failed to get updated rating:", ratingErr);
      }
    
      // Refresh movie data to get updated average rating
      const movieResponse = await movies.getById(id);
      setMovie(movieResponse.data);
      
    } catch (err) {
      console.error('Error rating movie:', err);
      setError('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser || !userRating) return;
    
    try {
      setIsSubmitting(true);
      
      await ratings.add(movie.id, userRating, userReview);
      
      // Exit review mode
      setIsReviewMode(false);
      
      // Refresh movie data
      const response = await movies.getById(id);
      setMovie(response.data);
      
      // Update local state
      try {
        const ratingResponse = await ratings.get(id);
        if (ratingResponse.data && ratingResponse.data.rating) {
          setUserReview(ratingResponse.data.rating.review || '');
        }
      } catch (err) {
        console.error("Couldn't refresh user review");
      }
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle review deletion
  const handleDeleteRating = async () => {
    if (!currentUser) return;
    
    if (!window.confirm('Are you sure you want to delete your rating and review?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await ratings.delete(movie.id);
      
      setUserRating(0);
      setUserReview('');
      setIsReviewMode(false);
      
      // Refresh movie data
      const response = await movies.getById(id);
      setMovie(response.data);
      
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError('Failed to delete rating');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle watchlist item change from child MovieCard components
  const handleWatchlistChange = (movieId, isInWatchlist, newWatchlistId) => {
    if (parseInt(movieId) === parseInt(id)) {
      setInWatchlist(isInWatchlist);
      if (isInWatchlist && newWatchlistId) {
        setWatchlistId(newWatchlistId);
        // Fetch the details of the newly added watchlist item
        fetchWatchlistDetails(newWatchlistId);
      } else {
        setWatchlistId(null);
        setWatchlistNotes('');
      }
    }
  };
  
  // Fetch watchlist item details (notes, timestamp, etc)
  const fetchWatchlistDetails = async (itemId) => {
    if (!currentUser || !itemId) return;
    
    try {
      const response = await fetch(`/api/watchlist/${itemId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Watchlist item details:", data);
        
        if (data.status === 'success' && data.item) {
          setWatchlistNotes(data.item.notes || '');
          if (data.item.added_at) {
            setWatchlistAddedTime(data.item.added_at);
          }
        }
      } else {
        console.error(`Error fetching watchlist details: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch watchlist details:", err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 flex items-center text-blue-600 hover:underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to movies
          </button>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-800">Movie not found</p>
          <Link to="/movies" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to movies
          </Link>
        </div>
      </div>
    );
  }
  
  // Format release date
  const releaseDate = movie.release_date 
    ? new Date(movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : 'Unknown';
    
  // Format genres - handle different formats (pipe or comma separated)
  const genres = movie.genres 
    ? (movie.genres.includes('|') 
        ? movie.genres.split('|') 
        : movie.genres.includes(',') 
          ? movie.genres.split(',') 
          : [movie.genres])
    : [];
    
  // Clean up any empty genres
  const cleanGenres = genres.filter(g => g.trim() !== '');
    
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center text-blue-600 hover:underline"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to movies
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Movie Header with Backdrop */}
        <div className="relative h-80 bg-gray-900">
          {movie.poster_path && (
            <div className="absolute inset-0 bg-cover bg-center opacity-30" 
                 style={{ backgroundImage: `url(${movie.poster_path})` }}>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          <div className="relative h-full flex items-end p-6">
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
              {movie.release_date && (
                <p className="text-lg text-gray-300">{new Date(movie.release_date).getFullYear()}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Movie Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Poster and Ratings Column */}
            <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path} 
                  alt={movie.title} 
                  className="rounded-lg shadow-md w-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-poster.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              
              {/* Rating Card */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
                  <span className="font-bold text-2xl">
                    {(movie.vote_average || movie.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-gray-600 ml-2">/ 10</span>
                </div>
                <p className="text-sm text-gray-600">
                  {(movie.vote_count || movie.votes || 0).toLocaleString()} votes
                </p>
                
                {(movie.average_rating || movie.avg_rating) && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium">
                      User Rating: {(movie.average_rating || movie.avg_rating).toFixed(1)} / 5
                    </p>
                    <p className="text-xs text-gray-600">
                      {(movie.rating_count || movie.ratings_count || 0)} ratings
                    </p>
                  </div>
                )}
              </div>
              
              {/* Watchlist Widget */}
              {currentUser && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  {watchlistMessage && (
                    <div className="mb-3 p-2 bg-blue-100 text-blue-800 text-sm rounded">
                      <FontAwesomeIcon icon={faCheck} className="mr-1" />
                      {watchlistMessage}
                    </div>
                  )}
                  
                  {watchlistError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-800 text-sm rounded">
                      <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                      {watchlistError}
                    </div>
                  )}
                  
                  <button
                    onClick={handleToggleWatchlist}
                    disabled={watchlistLoading}
                    className={`w-full py-2 px-4 rounded-md text-center flex items-center justify-center transition-colors duration-200 ${
                      inWatchlist
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {watchlistLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FontAwesomeIcon 
                          icon={inWatchlist ? fasBookmark : farBookmark} 
                          className="mr-2" 
                        />
                        {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </span>
                    )}
                  </button>
                  
                  {inWatchlist && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Added: {
                          watchlistAddedTime ? 
                          new Date(watchlistAddedTime).toLocaleDateString() :
                          new Date().toLocaleDateString() // Fallback to current date
                        }</span>
                        <span>By: {currentUser.username}</span>
                      </div>
                      
                      {isEditingNotes ? (
                        <div>
                          <textarea
                            value={watchlistNotes}
                            onChange={(e) => setWatchlistNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Add notes about this movie..."
                          ></textarea>
                          <div className="mt-2 flex justify-end space-x-2">
                            <button
                              onClick={() => setIsEditingNotes(false)}
                              className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                              disabled={watchlistLoading}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveNotes}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md"
                              disabled={watchlistLoading}
                            >
                              {watchlistLoading ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-medium text-gray-700">Notes:</p>
                            <button
                              onClick={() => setIsEditingNotes(true)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              <FontAwesomeIcon icon={faPen} className="mr-1" size="xs" />
                              {watchlistNotes ? 'Edit' : 'Add'}
                            </button>
                          </div>
                          <p className="text-gray-600 italic min-h-[40px]">
                            {watchlistNotes || (
                              <span className="text-gray-400">No notes added yet</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* User Rating Section */}
              {currentUser && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Your Rating</h3>
                  <RatingStars
                    initialRating={userRating}
                    onRate={handleRateMovie}
                    size="lg"
                  />
                  
                  {userRating > 0 ? (
                    <div className="mt-3">
                      {userReview ? (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Your review:</p>
                          <p className="text-sm text-gray-700 mt-1">{userReview}</p>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => setIsReviewMode(true)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={handleDeleteRating}
                              className="text-sm text-red-600 hover:underline"
                              disabled={isSubmitting}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsReviewMode(true)}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                          disabled={isSubmitting}
                        >
                          Add a review
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-600">
                      Click on stars to rate this movie
                    </p>
                  )}
                  
                  {/* Review Form */}
                  {isReviewMode && (
                    <form onSubmit={handleSubmitReview} className="mt-3">
                      <textarea
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="Share your thoughts about this movie..."
                      ></textarea>
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReviewMode(false);
                            setUserReview(movie.user_review || '');
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
            
            {/* Content Column */}
            <div className="md:w-2/3 lg:w-3/4 md:pl-8">
              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Overview</h3>
                <p className="text-gray-700">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
              
              {/* Info Table */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4">
                        <div className="flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                          Release Date
                        </div>
                      </td>
                      <td className="py-2">{releaseDate}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        <div className="flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faFilm} className="mr-2" />
                          Genres
                        </div>
                      </td>
                      <td className="py-2">
                        {cleanGenres.length > 0
                          ? cleanGenres.map((genre, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1"
                              >
                                {genre.trim()}
                              </span>
                            ))
                          : 'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        <div className="flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          Director
                        </div>
                      </td>
                      <td className="py-2">{movie.director || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        <div className="flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          Cast
                        </div>
                      </td>
                      <td className="py-2">{movie.actors || 'N/A'}</td>
                    </tr>
                    {movie.imdb_id && (
                      <tr>
                        <td className="py-2 pr-4">
                          <div className="flex items-center text-gray-500">
                            IMDb
                          </div>
                        </td>
                        <td className="py-2">
                          <a 
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {movie.imdb_id}
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Login to rate/watchlist prompt */}
              {!currentUser && (
                <div className="mb-8 bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-700 mb-2">
                    <strong>Want to rate this movie or add it to your watchlist?</strong> Sign in to track movies you want to watch and leave ratings.
                  </p>
                  <div className="flex space-x-2">
                    <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                      Sign in
                    </Link>
                    <Link to="/register" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium">
                      Create account
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Similar Movies */}
              {similarMovies && similarMovies.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Similar Movies</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {similarMovies.slice(0, 6).map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onWatchlistChange={handleWatchlistChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePage;