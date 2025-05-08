import { useState } from "react";

function MovieCard({
  title,
  poster,
  rating,
  userRating,
  liked,
  onDelete,
  onClick,
  onRate,
  onLike,
}) {
  const movie = { title, poster, rating, userRating, liked };

  const [hoveredRating, setHoveredRating] = useState(null);
  const [localUserRating, setLocalUserRating] = useState(userRating || 0);
  const [localLiked, setLocalLiked] = useState(liked || false);

  const handleRate = (val) => {
    setLocalUserRating(val);
    onRate && onRate({ ...movie, userRating: val });
  };

  const handleLikeToggle = () => {
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    onLike && onLike({ ...movie, liked: newLiked });
  };

  const renderStars = () => {
    const current = hoveredRating ?? localUserRating;

    return (
      <div className="rating rating-sm rating-half">
        {[1, 2, 3, 4, 5].flatMap((i) => {
          const halfVal = i * 2 - 1;
          const fullVal = i * 2;
          return [
            <input
              key={`half-${i}`}
              type="radio"
              name={`rating-${title}`}
              className="mask mask-star-2 mask-half-1 bg-yellow-400"
              aria-label={`${i - 0.5} star`}
              checked={current === halfVal}
              onMouseEnter={() => setHoveredRating(halfVal)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleRate(halfVal);
              }}
              readOnly
            />,
            <input
              key={`full-${i}`}
              type="radio"
              name={`rating-${title}`}
              className="mask mask-star-2 mask-half-2 bg-yellow-400"
              aria-label={`${i} star`}
              checked={current === fullVal}
              onMouseEnter={() => setHoveredRating(fullVal)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleRate(fullVal);
              }}
              readOnly
            />,
          ];
        })}
      </div>
    );
  };

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition w-48 cursor-pointer flex flex-col relative"
    >
      <img src={poster} alt={title} className="w-full h-72 object-cover" />

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>

          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-600 mr-2">You:</span>
            {renderStars()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-3 pb-3">
        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeToggle();
          }}
          className="btn btn-circle btn-sm border-none text-red-500 bg-white hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={localLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Deleting movie:", movie.title);
              onDelete(movie);
            }}
            className="bg-red-500 text-white text-sm py-1 px-2 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
