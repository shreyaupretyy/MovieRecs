import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

const MovieCard = ({ movie }) => {
  // Format genres from pipe-separated string to array
  const genres = movie.genres ? movie.genres.split('|').slice(0, 2) : [];
  
  // Default image if poster is not available
  const fallbackImage = "https://via.placeholder.com/300x450?text=No+Poster";
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] relative">
        <img 
          src={movie.poster_path || fallbackImage} 
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        
        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/75 text-white text-sm font-bold rounded-full px-2 py-1 flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </Link>
      
      <div className="p-4">
        <Link to={`/movies/${movie.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{movie.title}</h3>
          
          {/* Year */}
          {movie.release_date && (
            <p className="text-sm text-gray-600 mb-2">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
          
          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {genres.map((genre) => (
                <span 
                  key={genre} 
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;