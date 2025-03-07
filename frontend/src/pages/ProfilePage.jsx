import React from 'react';

const ProfilePage = () => {
  // Mock user data
  const user = {
    username: 'moviefan42',
    email: 'user@example.com',
    joinDate: '2023-01-15'
  };

  // Mock rated movies
  const ratedMovies = [
    { id: 1, title: 'The Shawshank Redemption', rating: 5, ratedOn: '2023-02-10' },
    { id: 2, title: 'The Godfather', rating: 4.5, ratedOn: '2023-02-15' },
    { id: 3, title: 'The Dark Knight', rating: 5, ratedOn: '2023-03-01' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>
          
          {/* User info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Rated movies */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Movies You've Rated</h2>
            
            {ratedMovies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Movie</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Your Rating</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ratedMovies.map(movie => (
                      <tr key={movie.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{movie.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{movie.rating} / 5</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(movie.ratedOn).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">You haven't rated any movies yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;