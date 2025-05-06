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
  const movie = { title, poster, rating };

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

  // daisyUI 评分组件渲染
  const renderStars = () => {
    const current = hoveredRating ?? localUserRating;

    return (
      <div className="rating rating-sm">
        {[1, 2, 3, 4, 5].flatMap((i) => [
          <input
            key={`${i}-half`}
            type="radio"
            name={`rating-${title}-half`}
            className="bg-yellow-400 mask mask-star-2 mask-half-1"
            onMouseEnter={() => setHoveredRating(i * 2 - 1)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(i * 2 - 1);
            }}
            checked={current === i * 2 - 1}
            readOnly
          />,
          <input
            key={`${i}-full`}
            type="radio"
            name={`rating-${title}-full`}
            className="bg-yellow-400 mask mask-star-2 mask-half-2"
            onMouseEnter={() => setHoveredRating(i * 2)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(i * 2);
            }}
            checked={current === i * 2}
            readOnly
          />,
        ])}
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
          <p className="text-xs text-gray-500">TMDB: ⭐ {rating ?? "N/A"}</p>

          {/* User rating */}
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
          className="text-xl"
        >
          {localLiked ? "❤️" : "🤍"}
        </button>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
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
