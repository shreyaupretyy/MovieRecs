import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faChartLine, faStar } from "@fortawesome/free-solid-svg-icons";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../contexts/AuthContext";

// Define the backend API URL explicitly
const API_URL = "http://localhost:5000";

const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recommendationMessage, setRecommendationMessage] = useState("");
  
  const { currentUser } = useAuth();
  
  // Initialize the database when the component mounts
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoadingPopular(true);
        
        console.log("Testing direct API connection...");
        
        // First try a simpler request to test connectivity
        try {
          const testResponse = await fetch(`${API_URL}/api/healthcheck`);
          const testData = await testResponse.json();
          console.log("Health check response:", testData);
        } catch (testError) {
          console.error("Health check failed:", testError);
          setError("Cannot connect to API server. Please make sure the backend is running.");
          setIsLoadingPopular(false);
          return;
        }
        
        // Now try to initialize
        const initResponse = await fetch(`${API_URL}/api/initialize`);
        
        if (!initResponse.ok) {
          const errorText = await initResponse.text();
          console.error("Server error:", errorText);
          throw new Error(`Server responded with status: ${initResponse.status}`);
        }
        
        const initData = await initResponse.json();
        console.log("Database initialization:", initData);
        
        if (initData.status === "success") {
          console.log("Initialization successful, fetching movies");
          fetchPopularMovies();
        } else {
          setError(initData.message || "Failed to initialize the movie database");
          setIsLoadingPopular(false);
        }
      } catch (err) {
        console.error("Error initializing database:", err);
        setError(`Connection error: ${err.message}`);
        
        // Try to fetch movies anyway in case they already exist
        fetchPopularMovies();
      }
    };
    
    initializeDatabase();
  }, []);
  
  // Fetch popular movies function
  const fetchPopularMovies = async () => {
    try {
      setIsLoadingPopular(true);
      setError("");
      
      const moviesResponse = await fetch(`${API_URL}/api/movies?page=1&per_page=8&sort_by=popularity&order=desc`);
      
      if (!moviesResponse.ok) {
        const errorText = await moviesResponse.text();
        console.error("Server error:", errorText);
        throw new Error(`Server responded with status: ${moviesResponse.status}`);
      }
      
      const moviesData = await moviesResponse.json();
      console.log("Movies data:", moviesData);
      
      if (moviesData.movies) {
        setPopularMovies(moviesData.movies);
      } else {
        console.error("Unexpected response format:", moviesData);
        setError("Received invalid movie data from server");
      }
    } catch (err) {
      console.error("Error fetching popular movies:", err);
      setError(`Failed to load movies: ${err.message}`);
    } finally {
      setIsLoadingPopular(false);
    }
  };
  
  // Fetch recommendations if user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchRecommendations = async () => {
      try {
        setIsLoadingRecommended(true);
        
        const recResponse = await fetch(`${API_URL}/api/recommendations?limit=8`, {
          credentials: 'include'
        });
        
        if (!recResponse.ok) {
          throw new Error(`Failed to fetch recommendations: ${recResponse.status}`);
        }
        
        const recData = await recResponse.json();
        console.log("Recommendations data:", recData);
        
        if (recData.recommendations) {
          setRecommendedMovies(recData.recommendations);
          setRecommendationMessage(recData.message || "");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setIsLoadingRecommended(false);
      }
    };
    
    fetchRecommendations();
  }, [currentUser]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Discover Movies You'll Love
          </h1>
          <p className="text-xl mb-8">
            Get personalized movie recommendations based on your taste.
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-4">
            <FontAwesomeIcon icon={faFilm} className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Explore Movies</h3>
          <p className="text-gray-600 mb-4">
            Browse our extensive collection of movies from various genres and eras.
          </p>
          <Link
            to="/movies"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse movies →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-4">
            <FontAwesomeIcon icon={faStar} className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
          <p className="text-gray-600 mb-4">
            Share your opinions by rating and reviewing movies you've watched.
          </p>
          {currentUser ? (
            <Link
              to="/rated"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View your ratings →
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in to rate →
            </Link>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
          <p className="text-gray-600 mb-4">
            Receive personalized movie suggestions based on your ratings.
          </p>
          {currentUser ? (
            <Link
              to="/recommended"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View recommendations →
            </Link>
          ) : (
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create account →
            </Link>
          )}
        </div>
      </div>
      
      {/* Recommended Movies Section for logged in users */}
    {currentUser && (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended For You
          </h2>
          <Link
            to="/recommended"
            className="text-blue-600 hover:text-blue-800"
          >
            View all →
          </Link>
        </div>
        
        {isLoadingRecommended ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : recommendedMovies && recommendedMovies.length > 0 ? (
          <>
            {recommendationMessage && (
              <p className="mb-4 text-gray-600">
                {recommendationMessage}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedMovies.slice(0, 4).map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  showRating={true} 
                  onRatingChange={(movieId, newRating) => {
                    // Update the local state to show the new rating
                    setRecommendedMovies(currentMovies =>
                      currentMovies.map(m => 
                        m.id === movieId ? { ...m, user_rating: newRating } : m
                      )
                    );
                    
                    // Show success message
                    setSuccessMessage(`Rating saved for ${
                      recommendedMovies.find(m => m.id === movieId)?.title
                    }`);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              Rate some movies to get personalized recommendations!
            </p>
            <Link
              to="/movies"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </section>
    )}
      
      {/* Popular Movies */}
      <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Popular Movies</h2>
        <Link
          to="/movies?sort=popularity"
          className="text-blue-600 hover:text-blue-800"
        >
          View all →
        </Link>
      </div>
      
      {/* Success or Error Messages */}
      {successMessage && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isLoadingPopular ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : popularMovies && popularMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              showRating={true} 
              onRatingChange={(movieId, newRating) => {
                // Update the local state to show the new rating
                setPopularMovies(currentMovies =>
                  currentMovies.map(m => 
                    m.id === movieId ? { ...m, user_rating: newRating } : m
                  )
                );
                
                // Show success message
                setSuccessMessage(`Rating saved for ${
                  popularMovies.find(m => m.id === movieId)?.title
                }`);
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">No movies found in the database.</p>
          <Link
            to="/movies"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      )}
    </section>
    </div>
  );
};

export default HomePage;