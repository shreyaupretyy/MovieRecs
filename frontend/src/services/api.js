import axios from 'axios';

// Use import.meta.env instead of process.env for Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log("Using API URL:", API_URL); // Debug log to verify URL in console

// Create axios instance with withCredentials for session cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add a reasonable timeout (10 seconds)
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx range
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", {
        request: error.request,
        url: error.config?.url,
        timeout: error.config?.timeout
      });
      error.message = 'No response from server. Please check your internet connection and ensure the backend server is running.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Setup Error:", error.message);
    }
    
    // Handle timeout errors more specifically
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. The server might be down or overloaded.';
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const auth = {
  // Register a new user
  register: (userData) => {
    // Log the request for debugging
    console.log('Sending registration request:', { ...userData, password: '[REDACTED]' });
    return api.post('/auth/register', userData);
  },
  
  // Login with username and password
  login: (credentials) => {
    // Log the request for debugging
    console.log('Sending login request:', { username: credentials.username, password: '[REDACTED]' });
    return api.post('/auth/login', credentials);
  },
  
  // Logout the current user
  logout: () => api.post('/auth/logout'),
  
  // Check if the user is authenticated
  checkAuth: () => api.get('/auth/check'),
  
  // Get user profile
  getProfile: () => api.get('/user/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/user/profile', profileData)
};

// Movie Services
export const movies = {
  getAll: (page = 1, perPage = 20, sortBy = 'popularity', order = 'desc') => 
    api.get('/movies', {
      params: {
        page,
        per_page: perPage,
        sort_by: sortBy,
        order
      }
    }),
    
  // Updated getById method with better error handling
  getById: (id) => {
    if (!id) {
      return Promise.reject(new Error("Movie ID is required"));
    }
    return api.get(`/movies/${id}`);
  },
  
  // Updated search method that correctly handles both query and genre filters
  search: (query = '', genre = '', page = 1, perPage = 20, sortBy = 'popularity', order = 'desc') => {
    // Build params object
    const params = {
      page,
      per_page: perPage,
      sort_by: sortBy,
      order
    };
    
    // Add query and genre if they exist
    if (query) params.search = query;
    if (genre) params.genre = genre;
    
    // Use the main /movies endpoint with all filters
    return api.get('/movies', { params });
  },
  
  getGenres: () => api.get('/genres'),
  
  // Optional: Add method to get similar movies if you implement this endpoint
  getSimilar: (movieId, limit = 6) => api.get(`/movies/${movieId}/similar`, {
    params: { limit }
  }),
  
  // Add method to load movies from OMDb API
  loadFromOmdb: (forceRefresh = false) => 
    api.post('/movies/load-from-omdb', { force_refresh: forceRefresh })
};

// Rating Services
// Rating Services
export const ratings = {
  add: (movieId, ratingValue, review = '') => {
    console.log(`Adding rating ${ratingValue} for movie ${movieId}`);
    return api.post('/ratings', { 
      movie_id: movieId, 
      rating: ratingValue,
      review: review 
    });
  },
  
  get: (movieId) => {
    console.log(`Getting rating for movie ${movieId}`);
    return api.get(`/ratings/${movieId}`);
  },
  
  delete: (movieId) => {
    console.log(`Deleting rating for movie ${movieId}`);
    return api.delete(`/ratings/${movieId}`);
  },
  
  getUserRatings: (page = 1, perPage = 20) => 
    api.get('/user/ratings', {
      params: { page, per_page: perPage }
    }),
    
  getRatedMovies: (page = 1, perPage = 20) => 
    api.get('/user/rated-movies', {
      params: { page, per_page: perPage }
    })
};

// Recommendation Services
export const recommendations = {
  getRecommendations: (count = 10) => api.get(`/recommendations?count=${count}`)
};

// Health check service for diagnostics
export const health = {
  check: () => api.get('/healthcheck')
};

// Retry function for failed requests (optional utility)
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 1.5);
  }
};

// Export a function to check if the API is reachable
export const checkApiConnection = async () => {
  try {
    const response = await health.check();
    return {
      connected: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

export default {
  auth,
  movies,
  ratings,
  recommendations,
  health,
  retry,
  checkApiConnection
};