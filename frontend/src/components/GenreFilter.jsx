import React, { useEffect, useState } from 'react';
import { movies } from '../services/api';

const GenreFilter = ({ onGenreSelect, selectedGenre = '' }) => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movies.getGenres();
        setGenres(response.data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-4">Loading genres...</div>;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Genres</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onGenreSelect('')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedGenre === '' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreSelect(genre)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedGenre === genre 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;