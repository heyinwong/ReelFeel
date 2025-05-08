import { useState } from "react";

function MovieCard({
  title,
  poster,
  rating,
  user_rating,
  liked,
  onDelete,
  onClick,
  onRate,
  onLike,
  username, // ensure it's passed in
}) {
  const [hoveredRating, setHoveredRating] = useState(null);
  const [localUserRating, setLocalUserRating] = useState(user_rating || 0);
  const [localLiked, setLocalLiked] = useState(liked || false);

  const handleRate = (val) => {
    setLocalUserRating(val);
    if (onRate) {
      onRate({ title, user_rating: val, username });
    }
  };

  const handleLikeToggle = () => {
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    if (onLike) {
      onLike({ title, liked: newLiked, username });
    }
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
      className="relative w-52 flex flex-col items-center transform transition-transform duration-200 hover:scale-105"
      onClick={() => onClick && onClick({ title })}
    >
      {/* 胶片背景 */}
      <div
        className="relative w-48 h-72 bg-no-repeat bg-center bg-contain drop-shadow-lg"
        style={{ backgroundImage: "url('/poster.jpg')" }}
      >
        <img
          src={poster}
          alt={title}
          className="absolute top-[3%] left-[6%] w-[88%] h-[94%] object-cover rounded"
        />
      </div>

      {/* 信息区域 */}
      <div className="mt-3 bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 w-full text-center">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
        <div className="flex justify-center mb-2">{renderStars()}</div>
        <div className="flex justify-between items-center px-2 pb-1">
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

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete({ title });
              }}
              className="bg-red-500 text-white text-sm py-1 px-2 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
