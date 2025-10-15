import React, { useState } from 'react';
import Icon from './Icon';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, size = 'text-lg' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHoverRating(star)}
          onClick={(e) => {
            e.stopPropagation();
            onRate(star);
          }}
          className={`transition-colors duration-150 ${size} ${
            (hoverRating || rating) >= star
              ? 'text-yellow-400'
              : 'text-neutral-400 dark:text-neutral-600'
          }`}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Icon name="star" />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
