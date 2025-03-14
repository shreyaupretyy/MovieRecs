import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartLine, 
  faExclamationTriangle, 
  faInfoCircle, 
  faSync, 
  faRandom
} from "@fortawesome/free-solid-svg-icons";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import { useAuth } from "../contexts/AuthContext";
import { recommendations } from "../services/api";

const RecommendedMoviesPage = () => {
  const { currentUser } = useAuth();
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(16); // Number of movies per page
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Fetch recommendations function - can be called any time to get fresh recommendations
  const fetchRecommendations = async (showRefreshingState = false) => {
    if (!currentUser) return;
    
    try {
      // Set appropriate loading state based on context
      if (showRefreshingState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      
      // Add timestamp and refresh parameter to avoid caching and get fresh recommendations
      const response = await recommendations.getRecommendations(48, true);
      
      if (response.data && response.data.recommendations) {
        setRecommendedMovies(response.data.recommendations);
        setRecommendationMessage(response.data.message || "");
        setLastRefreshed(new Date());
        
        // If refreshing, show a success message
        if (showRefreshingState) {
          setSuccessMessage("Recommendations refreshed with new data");
          setTimeout(() => setSuccessMessage(""), 3000);
        }
        
        // Reset to first page when refreshing recommendations
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
      } else {
        setError("Failed to load recommendations. Unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Get initial recommendations when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchRecommendations();
    }
  }, [currentUser]);
  
  // Calculate pagination
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = recommendedMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(recommendedMovies.length / moviesPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Handle refresh recommendations
  const handleRefreshRecommendations = () => {
    fetchRecommendations(true);
  };
  
  // Handle movie rating change
  const handleRatingChange = (movieId, newRating) => {
    // Update local state with new rating
    setRecommendedMovies(prevMovies =>
      prevMovies.map(movie =>
        movie.id === movieId ? { ...movie, user_rating: newRating } : movie
      )
    );
    
    // Show success message
    const movieTitle = recommendedMovies.find(m => m.id === movieId)?.title || "Movie";
    
    if (newRating > 0) {
      setSuccessMessage(`Rating saved for "${movieTitle}"`);
    } else {
      setSuccessMessage(`Rating removed for "${movieTitle}"`);
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
    
    // Refresh recommendations after a short delay when rating changes
    // This ensures the model takes the new rating into account
    setTimeout(() => {
      fetchRecommendations(false);
    }, 1000);
  };
  
  // If user is not logged in, show sign in prompt
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-4">Please sign in</h2>
          <p className="mb-4">You need to be signed in to view personalized recommendations.</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">Recommended Movies</h1>
        
        <button
          onClick={handleRefreshRecommendations}
          disabled={isRefreshing || isLoading}
          className={`mt-2 sm:mt-0 flex items-center px-4 py-2 rounded ${
            isRefreshing || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}
        >
          {isRefreshing ? (
            <>
              <FontAwesomeIcon icon={faSync} className="animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRandom} className="mr-2" />
              Get New Recommendations
            </>
          )}
        </button>
      </div>
      
      {recommendationMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-blue-700">{recommendationMessage}</p>
            {!isLoading && !isRefreshing && (
              <p className="text-blue-500 text-sm mt-1">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 p-4 rounded-lg mb-6 transition-opacity duration-300">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => fetchRecommendations(true)}
              className="text-red-700 underline mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : recommendedMovies.length > 0 ? (
        <div>
          {isRefreshing && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-700">Generating new recommendations...</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showRating={true} 
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <div className="mb-6">
            <FontAwesomeIcon icon={faChartLine} className="text-4xl text-blue-600" />
          </div>
          <h2 className="text-xl font-bold mb-4">Get personalized recommendations</h2>
          <p className="text-gray-600 mb-6">
            Rate some movies to get personalized recommendations based on your taste preferences.
            <br />
            The more movies you rate, the better recommendations you'll receive!
          </p>
          <Link
            to="/movies"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Movies to Rate
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendedMoviesPage;