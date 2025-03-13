import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faExclamationTriangle, faFilm, faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { movies } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    favorite_genre: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [genericError, setGenericError] = useState('');
  const [genreOptions, setGenreOptions] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Fetch genres for dropdown
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const response = await movies.getGenres();
        if (response.data && response.data.genres) {
          setGenreOptions(response.data.genres);
        } else {
          // Fallback genres if API fails
          setGenreOptions([
            'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
            'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
            'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller',
            'War', 'Western'
          ]);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
        // Fallback genres if API fails
        setGenreOptions([
          'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
          'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
          'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller',
          'War', 'Western'
        ]);
      } finally {
        setIsLoadingGenres(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenericError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create user data object (remove confirmPassword)
      const userData = { ...formData };
      delete userData.confirmPassword;
      
      await register(userData);
      
      // Redirect to home page after successful registration
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Display the specific error message
      setGenericError(err.message || 'An error occurred during registration. Please try again.');
      
      // If there are field-specific errors, set those
      if (err.message && err.message.toLowerCase().includes('username')) {
        setErrors(prev => ({ ...prev, username: 'Username already taken' }));
      } else if (err.message && err.message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative film reel patterns */}
      <div className="absolute top-10 left-10 opacity-10">
        <div className="w-20 h-20 border-4 border-gray-500 rounded-full"></div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <div className="w-32 h-32 border-4 border-gray-500 rounded-full"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faFilm} className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Our Movie Community
          </h2>
          <p className="mt-2 text-center text-md text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-2xl sm:rounded-lg sm:px-10 transform transition duration-500 ease-in-out hover:scale-[1.01]">
          {genericError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{genericError}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                  Username
                </div>
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Choose a unique username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" />
                  Email address
                </div>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-500" />
                    Password
                  </div>
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="At least 6 characters"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-500" />
                    Confirm password
                  </div>
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="favorite_genre" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFilm} className="mr-2 text-gray-500" />
                  Favorite movie genre
                </div>
              </label>
              <div className="mt-1">
                <select
                  id="favorite_genre"
                  name="favorite_genre"
                  value={formData.favorite_genre}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a genre (optional)</option>
                  {genreOptions.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                  Bio
                </div>
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about your favorite movies, directors, or anything film related..."
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Optional: Tell other members about your movie interests</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                {isLoading ? 'Creating your account...' : 'Create account'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Why join our movie community?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span> 
                <span>Rate and review your favorite movies</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span> 
                <span>Get personalized movie recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span> 
                <span>Create and share your movie watchlists</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span> 
                <span>Connect with other movie enthusiasts</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Sign in link for mobile - more prominent */}
        <div className="mt-6 text-center md:hidden">
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
      

    </div>
  );
};

export default RegisterPage;