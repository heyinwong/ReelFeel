import { useState } from "react";

function MovieCard({ title, poster, userRating, liked, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-52 flex flex-col items-center transform transition-transform duration-200 hover:scale-105 cursor-pointer"
      onClick={() => onClick && onClick({ title })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

        {/* 悬浮提示区域 */}
        {hovered && (
          <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/60 rounded px-2 py-1 flex flex-col items-center space-y-1">
            <span className="font-semibold text-sm text-center line-clamp-1">
              {title}
            </span>
            <div className="flex justify-between w-full px-1 items-center">
              {userRating ? (
                <span>⭐ {userRating / 2}</span>
              ) : (
                <span className="text-gray-300">Not Rated</span>
              )}
              {liked && (
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                     2 6.5 3.5 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87
                     C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
