import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faTimes, 
  faExclamationTriangle, 
  faUser, 
  faLock, 
  faEnvelope,
  faFilm,
  faInfoCircle,
  faSignOutAlt,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
  const { currentUser, updateProfile, logout, error: authError } = useAuth();
  const navigate = useNavigate();
  
  // Define genre options
  const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
    "Romance", "Science Fiction", "Thriller", "Western", "Family"
  ];
  
  const [formData, setFormData] = useState({
    email: '',
    bio: '',
    favorite_genre: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Initialize form data when user data is available
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form data when user data is available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        favorite_genre: currentUser.favorite_genre || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsLoading(false);
    }
  }, [currentUser]);
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Password validation
    if (showPasswordSection) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required to change password';
      }
      
      if (formData.new_password && formData.new_password.length < 6) {
        newErrors.new_password = 'New password must be at least 6 characters';
      }
      
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create update payload
      const updateData = {
        email: formData.email,
        bio: formData.bio,
        favorite_genre: formData.favorite_genre
      };
      
      // Add password fields if changing password
      if (showPasswordSection && formData.current_password && formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }
      
      // Submit update through AuthContext
      await updateProfile(updateData);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
      // Hide password section
      setShowPasswordSection(false);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Handle specific errors
      if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          serverErrors[error.param] = error.msg;
        });
        setErrors(serverErrors);
      } else if (err.response?.data?.message) {
        if (err.response.data.message.includes('password')) {
          setErrors({ current_password: 'Current password is incorrect' });
        } else if (err.response.data.message.includes('email')) {
          setErrors({ email: 'Email already in use' });
        } else {
          setErrors({ form: err.response.data.message });
        }
      } else {
        setErrors({ form: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/login');
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">Update your information and manage your account settings</p>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Header Card */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 sm:p-8">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : (
                  <FontAwesomeIcon icon={faUser} />
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{currentUser?.username || 'User'}</h2>
                <p className="text-gray-300">Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Alert Messages */}
          {authError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              </div>
            </div>
          )}
          
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.form}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div className="mb-10">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Username (disabled) */}
                  <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={currentUser?.username || ''}
                        disabled
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                  </div>
                  
                  {/* Email */}
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                          errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm sm:text-sm`}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faEnvelope} className={`${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Bio */}
                  <div className="mb-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself and your movie preferences..."
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      ></textarea>
                      <div className="absolute right-2 bottom-2 text-gray-400">
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Your bio will be visible to other users</p>
                  </div>
                  
                  {/* Favorite Genre */}
                  <div>
                    <label htmlFor="favorite_genre" className="block text-sm font-medium text-gray-700 mb-1">
                      Favorite Genre
                    </label>
                    <div className="relative">
                      <select
                        id="favorite_genre"
                        name="favorite_genre"
                        value={formData.favorite_genre}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select your favorite genre</option>
                        {genreOptions.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faFilm} className="text-gray-400" />
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">This helps us personalize your recommendations</p>
                  </div>
                </div>
              </div>
              
              {/* Password Section */}
              <div className="mb-10">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faLock} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {!showPasswordSection ? (
                    <div>
                      <p className="text-gray-600 mb-4">Update your password to maintain account security. We recommend using a strong password that you don't use elsewhere.</p>
                      <button
                        type="button"
                        onClick={() => setShowPasswordSection(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            id="current_password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                              errors.current_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } rounded-md shadow-sm sm:text-sm`}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon 
                              icon={faLock} 
                              className={`${errors.current_password ? 'text-red-400' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                        {errors.current_password && (
                          <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>
                        )}
                      </div>
                      
                      {/* New Password */}
                      <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                              errors.new_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } rounded-md shadow-sm sm:text-sm`}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon 
                              icon={faLock} 
                              className={`${errors.new_password ? 'text-red-400' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                        {errors.new_password ? (
                          <p className="mt-1 text-xs text-red-600">{errors.new_password}</p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
                        )}
                      </div>
                      
                      {/* Confirm New Password */}
                      <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                              errors.confirm_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } rounded-md shadow-sm sm:text-sm`}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon 
                              icon={faLock} 
                              className={`${errors.confirm_password ? 'text-red-400' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                        {errors.confirm_password && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
                        )}
                      </div>
                      
                      {/* Password section actions */}
                      <div className="flex items-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordSection(false);
                            setFormData(prev => ({
                              ...prev,
                              current_password: '',
                              new_password: '',
                              confirm_password: ''
                            }));
                            setErrors(prev => {
                              const { current_password, new_password, confirm_password, ...rest } = prev;
                              return rest;
                            });
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200">
                {/* Save Changes Button */}
                <div className="mb-4 sm:mb-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
                
                {/* Sign Out Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-gray-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Additional Account Information Card (Optional) */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Active
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentUser?.last_login ? new Date(currentUser.last_login).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Ratings Submitted</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentUser?.ratings_count || '0'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;