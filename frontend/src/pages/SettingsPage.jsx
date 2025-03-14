import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faGlobe, 
  faShield, 
  faBell,
  faSave,
  faTrash,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const SettingsPage = () => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile settings
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    name: '',
    bio: ''
  });
  
  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences settings
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    showAdultContent: false
  });
  
  // Load user data
  useEffect(() => {
    if (currentUser) {
      // Set profile data from currentUser
      setProfile({
        username: currentUser.username || 'shreyauprety',
        email: currentUser.email || 'user@example.com',
        name: currentUser.name || '',
        bio: currentUser.bio || ''
      });
      
      // Set preferences from currentUser if available
      if (currentUser.preferences) {
        setPreferences({
          ...preferences,
          ...currentUser.preferences
        });
      }
    } else {
      // Redirect to login if not logged in
      navigate('/login', { 
        state: { 
          message: "Please log in to access settings",
          returnTo: '/settings'
        }
      });
    }
  }, [currentUser, navigate]);
  
  // Show a temporary message
  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, duration);
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call API to update profile
      await updateProfile(profile);
      showMessage('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showMessage('error', err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to change password
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showMessage('success', 'Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      showMessage('error', err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle preferences form submission
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call API to update preferences
      await updateProfile({ preferences });
      showMessage('success', 'Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      showMessage('error', err.message || 'Failed to update preferences');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone!'
    );
    
    if (!confirmed) return;
    
    // Ask for password to confirm
    const password = window.prompt('Please enter your password to confirm account deletion:');
    
    if (!password) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to delete account
      await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });
      
      // Log out user
      await logout();
      
      // Redirect to home page
      navigate('/', { 
        state: { message: 'Your account has been deleted successfully.' }
      });
    } catch (err) {
      console.error('Error deleting account:', err);
      showMessage('error', err.message || 'Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to access settings.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center mb-4 p-4">
              <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <p className="mt-2 font-medium">{profile.name || 'shreyauprety'}</p>
              <p className="text-sm text-gray-500">{profile.email || 'user@example.com'}</p>
              <p className="text-xs text-gray-400 mt-1">Member since: March 2025</p>
            </div>
            
            <nav>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Profile
              </button>
              
              <button 
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                  activeTab === 'password' 
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Password
              </button>
              
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                  activeTab === 'preferences' 
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Preferences
              </button>
              
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                  activeTab === 'privacy' 
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faShield} className="mr-2" />
                Privacy
              </button>
              
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                Notifications
              </button>
            </nav>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button 
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50"
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                <p className="mb-4 text-gray-600">
                  Manage your personal information and how it appears on your profile.
                </p>
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input 
                      type="text" 
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Username cannot be changed once set.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email"
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea 
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      rows="3"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                  <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
                <p className="mb-4 text-gray-600">
                  Change your account password. We recommend using a strong, unique password.
                </p>
                
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input 
                      type="password"
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      minLength="8"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faLock} className="mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <p className="mb-4 text-gray-600">
                  Customize your experience on the platform.
                </p>
                
                <form onSubmit={handlePreferencesSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                      value={preferences.language}
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="darkMode"
                        checked={preferences.darkMode}
                        onChange={(e) => setPreferences({...preferences, darkMode: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="darkMode" className="ml-2 text-sm text-gray-700">
                        Enable dark mode
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Use dark theme for the interface.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showAdultContent"
                        checked={preferences.showAdultContent}
                        onChange={(e) => setPreferences({...preferences, showAdultContent: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="showAdultContent" className="ml-2 text-sm text-gray-700">
                        Show adult content
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Include movies with adult content in search results.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                <p className="mb-4 text-gray-600">
                  Control who can see your activity and how your data is used.
                </p>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="publicProfile"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="publicProfile" className="ml-2 text-sm text-gray-700">
                      Public profile
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    Allow others to view your profile.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showWatchlist"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="showWatchlist" className="ml-2 text-sm text-gray-700">
                      Show my watchlist
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    Make your watchlist visible to other users.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showRatings"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="showRatings" className="ml-2 text-sm text-gray-700">
                      Show my ratings
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    Make your movie ratings visible to other users.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataUsage"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="dataUsage" className="ml-2 text-sm text-gray-700">
                      Allow data usage for recommendations
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    Let us use your activity data to improve movie recommendations.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Privacy Settings
                  </button>
                </div>
              </>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
                <p className="mb-4 text-gray-600">
                  Control which notifications you receive and how you receive them.
                </p>
                
                <h3 className="text-lg font-medium my-3">Email Notifications</h3>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNewReleases"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="emailNewReleases" className="ml-2 text-sm text-gray-700">
                      New movie releases
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailRecommendations"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="emailRecommendations" className="ml-2 text-sm text-gray-700">
                      Movie recommendations
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailAccount"
                      checked={true}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="emailAccount" className="ml-2 text-sm text-gray-700">
                      Account activity
                    </label>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium my-3">Push Notifications</h3>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNewReleases"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({...preferences, pushNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="pushNewReleases" className="ml-2 text-sm text-gray-700">
                      New movie releases
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushRecommendations"
                      checked={false}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="pushRecommendations" className="ml-2 text-sm text-gray-700">
                      Movie recommendations
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    onClick={handlePreferencesSubmit}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Notification Settings
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Debug Info */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;