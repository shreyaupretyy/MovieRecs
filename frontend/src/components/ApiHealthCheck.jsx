import React, { useState, useEffect } from 'react';
import { health } from '../services/api';

const ApiHealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await health.check();
        setStatus('online');
        setDetails(response.data);
      } catch (err) {
        setStatus('offline');
        setError(err.message || 'Could not connect to API');
      }
    };

    checkApiHealth();
  }, []);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4 my-4">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">API Connection Diagnostics</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          This tool checks your connection to the backend server.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">API Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {status === 'checking' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Checking...
                </span>
              )}
              {status === 'online' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              )}
              {status === 'offline' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Offline
                </span>
              )}
            </dd>
          </div>

          {status === 'offline' && (
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Error</dt>
              <dd className="mt-1 text-sm text-red-600 sm:mt-0 sm:col-span-2">
                {error}
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Troubleshooting:</h4>
                  <ul className="list-disc pl-5 text-xs text-gray-600 mt-1">
                    <li>Make sure your backend server is running</li>
                    <li>Check that the API URL is correct: <code>{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</code></li>
                    <li>Check for CORS issues in browser console</li>
                    <li>Restart your backend server and try again</li>
                  </ul>
                </div>
              </dd>
            </div>
          )}

          {status === 'online' && details && (
            <>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Message</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {details.message}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {details.timestamp}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Database Info</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {details.database_info && (
                    <ul className="list-disc pl-5">
                      <li>Movie count: {details.database_info.movie_count}</li>
                      <li>User count: {details.database_info.user_count}</li>
                    </ul>
                  )}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ApiHealthCheck;