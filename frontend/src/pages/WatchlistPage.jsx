import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashAlt, 
  faEdit, 
  faCheck, 
  faTimes, 
  faFilm, 
  faClock,
  faExclamationCircle,
  faStar,
  faBookmark,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { watchlist as watchlistApi } from '../services/api';

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w300";
const DEFAULT_POSTER = "/placeholder-poster.jpg";

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1
  });

  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const fetchWatchlist = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await watchlistApi.getWatchlist(page, 12);
      if (response?.data?.status === 'success') {
        const { items, pagination: paginationData } = response.data;
        setWatchlist(items || []);
        setPagination({
          page: paginationData?.page || 1,
          pages: paginationData?.pages || 1,
          total: paginationData?.total || 0
        });
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(`Error: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Failed to load your watchlist: ${err.message}`);
      } else {
        setError("An unknown error occurred while fetching your watchlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchWatchlist(newPage);
  };

  const handleRemove = async (watchlistId) => {
    if (!window.confirm('Remove this movie from your watchlist?')) {
      return;
    }
    try {
      await watchlistApi.removeFromWatchlist(watchlistId);
      setWatchlist(watchlist.filter(item => item.watchlist_id !== watchlistId));
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    } catch (err) {
      alert('Failed to remove movie. Please try again.');
    }
  };

  const handleSaveNotes = async (watchlistId) => {
    try {
      await watchlistApi.updateNotes(watchlistId, editNotes);
      setWatchlist(watchlist.map(item => {
        if (item.watchlist_id === watchlistId) {
          return { ...item, notes: editNotes };
        }
        return item;
      }));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update notes. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
            <FontAwesomeIcon icon={faBookmark} className="mr-3 text-blue-600" />
            My Watchlist
          </h1>

          <button
            onClick={() => fetchWatchlist(currentPage)}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FontAwesomeIcon icon={faSync} className="mr-2 h-4 w-4" />
            )}
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2 flex space-x-3">
                  <button 
                    onClick={() => fetchWatchlist(currentPage)}
                    className="text-sm text-red-700 underline hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading your watchlist...</p>
          </div>
        ) : watchlist.length === 0 && !error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faFilm} className="text-gray-300 text-5xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding movies to keep track of what you want to watch.</p>
            <Link 
              to="/movies" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faFilm} className="mr-2" />
              Browse Movies
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {watchlist.map(movie => (
                <div key={movie.watchlist_id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <Link to={`/movies/${movie.id}`} className="block overflow-hidden">
                    <img 
                      src={movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : DEFAULT_POSTER} 
                      alt={movie.title} 
                      className="w-full h-auto object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_POSTER;
                      }}
                    />
                  </Link>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/movies/${movie.id}`} className="hover:text-blue-600">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{movie.title}</h3>
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                      <span className="mr-2">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                      <span>
                        {movie.release_date 
                          ? new Date(movie.release_date).getFullYear()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      Added: {new Date(movie.added_at).toLocaleDateString()}
                    </div>
                    {editingId === movie.watchlist_id ? (
                      <div className="mt-3">
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows="2"
                          placeholder="Add notes..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-2 space-x-2">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveNotes(movie.watchlist_id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 min-h-[40px]">
                        <p className="text-sm text-gray-600 italic line-clamp-2">
                          {movie.notes || <span className="text-gray-400">No notes</span>}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setEditingId(movie.watchlist_id);
                          setEditNotes(movie.notes || '');
                        }}
                        disabled={editingId === movie.watchlist_id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                        Notes
                      </button>
                      <button
                        onClick={() => handleRemove(movie.watchlist_id)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-red-600 hover:bg-red-50"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md border ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium border-t border-b bg-white">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md border ${
                      currentPage === pagination.pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {pagination.total > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  Showing {watchlist.length} of {pagination.total} movie{pagination.total !== 1 ? 's' : ''} in your watchlist
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;