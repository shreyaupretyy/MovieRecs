import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';

const RatingStars = ({ initialRating = 0, onRate, size = 'md', readOnly = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Update internal rating when initialRating prop changes
  useEffect(() => {
    if (initialRating !== rating) {
      setRating(initialRating);
    }
  }, [initialRating]);
  
  const handleStarClick = (value) => {
    if (readOnly) return;
    
    // Toggle rating off if clicking the same star
    const newRating = value === rating ? 0 : value;
    setRating(newRating);
    
    // Call the parent component's callback
    if (onRate) {
      onRate(newRating);
    }
  };
  
  const handleStarHover = (value) => {
    if (readOnly) return;
    setHoverRating(value);
  };
  
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };
  
  // Determine star size based on prop
  const starSize = {
    'sm': 'h-4 w-4',
    'md': 'h-5 w-5',
    'lg': 'h-6 w-6',
    'xl': 'h-8 w-8'
  }[size] || 'h-5 w-5';
  
  // Create array of stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const displayValue = hoverRating || rating;
    
    // Determine if star should be full, half, or empty
    let star;
    if (displayValue >= i) {
      // Full star
      star = (
        <FontAwesomeIcon 
          key={i}
          icon={solidStar} 
          className={`${starSize} text-yellow-400`} 
        />
      );
    } else if (displayValue >= i - 0.5) {
      // Half star
      star = (
        <FontAwesomeIcon 
          key={i}
          icon={faStarHalfAlt} 
          className={`${starSize} text-yellow-400`} 
        />
      );
    } else {
      // Empty star
      star = (
        <FontAwesomeIcon 
          key={i}
          icon={regularStar} 
          className={`${starSize} ${readOnly ? 'text-gray-300' : 'text-gray-400'}`} 
        />
      );
    }
    
    stars.push(
      <div 
        key={i}
        className={`cursor-${readOnly ? 'default' : 'pointer'} p-1`}
        onClick={() => handleStarClick(i)}
        onMouseEnter={() => handleStarHover(i)}
      >
        {star}
      </div>
    );
  }
  
  return (
    <div 
      className="flex items-center" 
      onMouseLeave={handleMouseLeave}
    >
      {stars}
      {!readOnly && rating > 0 && (
        <span className="ml-2 text-gray-600 text-sm">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default RatingStars;