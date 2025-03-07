import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarIcon, ClockIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/solid';

// Components
import LoadingSpinner from '../components/LoadingSpinner';
import MovieCard from '../components/MovieCard';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // Mock user ID (in a real app, you'd get this from auth context/state)
  const userId = 1;
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details
        const movieResponse = await axios.get(`http://localhost:5000/api/movies/${id}`);
        setMovie(movieResponse.data);
        
        // Fetch recommendations
        const recommendationsResponse = await axios.get(`http://localhost:5000/api/recommendations/${id}`);
        setRecommendations(recommendationsResponse.data.recommendations);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleRatingChange = (rating) => {
    setUserRating(rating);
  };

  const submitRating = async () => {
    if (userRating === 0) return;
    
    try {
      setIsSubmittingRating(true);
      
      // Submit rating to API
      await axios.post('http://localhost:5000/api/ratings', {
        user_id: userId,
        movie_id: movie.id,
        rating: userRating
      });
      
      // Show success message or update UI
      alert('Rating submitted successfully!');
      
      setIsSubmittingRating(false);
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Movie not found</h2>
        <Link to="/movies" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Format release date
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'N/A';
  
  // Format genres
  const genres = movie.genres ? movie.genres.split('|') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Movie Banner */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden shadow-lg aspect-[2/3] bg-gray-800">
                <img 
                  src={movie.poster_path || "https://via.placeholder.com/300x450?text=No+Poster"} 
                  alt={`${movie.title} poster`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x450?text=No+Poster";
                  }}
                />
              </div>
            </div>
            
            {/* Movie Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
                <span className="text-xl text-gray-400">({releaseYear})</span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary-700 text-white px-2 py-1 rounded flex items-center">
                  <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">({movie.vote_count.toLocaleString()} votes)</span>
              </div>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((genre) => (
                  <span 
                    key={genre} 
                    className="inline-block bg-gray-700 text-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 mb-6">
                {movie.director && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">Director: {movie.director}</span>
                  </div>
                )}
                
                {movie.release_date && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">
                      Released: {new Date(movie.release_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {movie.actors && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">Cast: {movie.actors}</span>
                  </div>
                )}
              </div>
              
              {/* Overview */}
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 mb-6">{movie.overview || 'No overview available.'}</p>
              
              {/* User Rating */}
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">Rate This Movie</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        star <= userRating
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <StarIcon className="w-5 h-5" />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-300">
                    {userRating > 0 ? `${userRating} star${userRating > 1 ? 's' : ''}` : 'Select rating'}
                  </span>
                </div>
                <button
                  onClick={submitRating}
                  disabled={userRating === 0 || isSubmittingRating}
                  className={`mt-3 px-4 py-2 rounded font-medium ${
                    userRating === 0 || isSubmittingRating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-500'
                  }`}
                >
                  {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendations.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No recommendations found for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;